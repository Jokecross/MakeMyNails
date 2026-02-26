import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import Stripe from 'https://esm.sh/stripe@14'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, stripe-signature',
}

const PACK_CREDITS: Record<string, number> = {
  pack_starter: 5,
  pack_regular: 15,
  pack_addict:  40,
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  const stripe = new Stripe(Deno.env.get('STRIPE_SECRET_KEY')!, {
    apiVersion: '2024-04-10',
  })

  const signature = req.headers.get('stripe-signature')
  const webhookSecret = Deno.env.get('STRIPE_WEBHOOK_SECRET')!
  const body = await req.text()

  let event: Stripe.Event
  try {
    event = await stripe.webhooks.constructEventAsync(body, signature!, webhookSecret)
  } catch (err) {
    console.error('Webhook signature verification failed:', err.message)
    return new Response(JSON.stringify({ error: 'Invalid signature' }), {
      status: 400,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  }

  const supabase = createClient(
    Deno.env.get('SUPABASE_URL')!,
    Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!,
  )

  if (event.type === 'checkout.session.completed') {
    const session = event.data.object as Stripe.Checkout.Session

    // Skip if payment not paid (e.g. free trial)
    if (session.payment_status !== 'paid' && session.mode !== 'subscription') {
      return new Response(JSON.stringify({ received: true }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    const userId = session.client_reference_id ?? session.metadata?.userId
    const packId = session.metadata?.packId

    if (!userId || !packId) {
      console.error('Missing userId or packId in session metadata', session.id)
      return new Response(JSON.stringify({ error: 'Missing metadata' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    if (packId === 'sub_premium') {
      // Activate subscription
      const stripeSubscriptionId = typeof session.subscription === 'string'
        ? session.subscription
        : session.subscription?.id

      const periodEnd = stripeSubscriptionId
        ? (await stripe.subscriptions.retrieve(stripeSubscriptionId)).current_period_end
        : null

      const { error } = await supabase.rpc('activate_subscription_for_user', {
        p_user_id: userId,
        p_stripe_subscription_id: stripeSubscriptionId ?? null,
        p_period_end: periodEnd ? new Date(periodEnd * 1000).toISOString() : null,
      })
      if (error) {
        console.error('activate_subscription_for_user error:', error)
        return new Response(JSON.stringify({ error: error.message }), {
          status: 500,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        })
      }
    } else {
      // Add credits for one-time pack
      const credits = PACK_CREDITS[packId]
      if (!credits) {
        console.error('Unknown packId:', packId)
        return new Response(JSON.stringify({ error: `Unknown pack: ${packId}` }), {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        })
      }

      const stripePaymentIntentId = typeof session.payment_intent === 'string'
        ? session.payment_intent
        : session.payment_intent?.id ?? null

      const { error } = await supabase.rpc('purchase_pack_for_user', {
        p_user_id: userId,
        p_pack_id: packId,
        p_credits: credits,
        p_amount: (session.amount_total ?? 0) / 100,
        p_stripe_payment_intent_id: stripePaymentIntentId,
      })
      if (error) {
        console.error('purchase_pack_for_user error:', error)
        return new Response(JSON.stringify({ error: error.message }), {
          status: 500,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        })
      }
    }
  }

  // Handle subscription cancellation
  if (event.type === 'customer.subscription.deleted') {
    const subscription = event.data.object as Stripe.Subscription
    const userId = subscription.metadata?.userId
    if (userId) {
      await supabase
        .from('subscriptions')
        .update({ status: 'canceled' })
        .eq('user_id', userId)
        .eq('stripe_subscription_id', subscription.id)
    }
  }

  return new Response(JSON.stringify({ received: true }), {
    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
  })
})
