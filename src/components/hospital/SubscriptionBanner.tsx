import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Crown, Clock, AlertCircle, CheckCircle } from "lucide-react";

interface Subscription {
  id: string;
  plan: string;
  is_active: boolean;
  trial_ends_at: string | null;
  subscription_ends_at: string | null;
  price_rupees: number;
  duration_months: number;
}

interface SubscriptionBannerProps {
  subscription: Subscription;
}

const SubscriptionBanner = ({ subscription }: SubscriptionBannerProps) => {
  const isTrialActive = subscription.plan === "trial" && subscription.trial_ends_at;
  const trialDaysRemaining = isTrialActive
    ? Math.ceil((new Date(subscription.trial_ends_at!).getTime() - Date.now()) / (1000 * 60 * 60 * 24))
    : 0;

  const isExpiringSoon = trialDaysRemaining > 0 && trialDaysRemaining <= 7;
  const isExpired = trialDaysRemaining <= 0 && subscription.plan === "trial";

  const pricingPlans = [
    { months: 4, price: 200, label: "4 Months", popular: false },
    { months: 6, price: 250, label: "6 Months", popular: true },
    { months: 8, price: 350, label: "8 Months", popular: false },
  ];

  if (isExpired) {
    return (
      <Card className="p-6 border-destructive/50 bg-destructive/5">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 rounded-xl bg-destructive/10 flex items-center justify-center flex-shrink-0">
              <AlertCircle className="w-6 h-6 text-destructive" />
            </div>
            <div>
              <h3 className="font-semibold text-destructive mb-1">Trial Expired</h3>
              <p className="text-sm text-muted-foreground">
                Your free trial has ended. Subscribe to continue accessing patient records.
              </p>
            </div>
          </div>
          <Button className="gap-2">
            <Crown className="w-4 h-4" />
            Subscribe Now
          </Button>
        </div>

        {/* Pricing Options */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
          {pricingPlans.map((plan) => (
            <Card 
              key={plan.months} 
              className={`p-4 text-center relative ${plan.popular ? "border-primary ring-2 ring-primary/20" : ""}`}
            >
              {plan.popular && (
                <span className="absolute -top-2 left-1/2 -translate-x-1/2 px-2 py-0.5 bg-primary text-primary-foreground text-xs font-medium rounded-full">
                  Popular
                </span>
              )}
              <p className="text-2xl font-bold text-foreground mb-1">₹{plan.price}</p>
              <p className="text-sm text-muted-foreground mb-3">{plan.label}</p>
              <Button variant={plan.popular ? "default" : "outline"} size="sm" className="w-full">
                Select
              </Button>
            </Card>
          ))}
        </div>
      </Card>
    );
  }

  if (isTrialActive) {
    return (
      <Card className={`p-4 ${isExpiringSoon ? "border-yellow-500/50 bg-yellow-500/5" : "border-primary/50 bg-primary/5"}`}>
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${isExpiringSoon ? "bg-yellow-500/10" : "bg-primary/10"}`}>
              {isExpiringSoon ? (
                <Clock className="w-5 h-5 text-yellow-600" />
              ) : (
                <CheckCircle className="w-5 h-5 text-primary" />
              )}
            </div>
            <div>
              <p className={`font-medium ${isExpiringSoon ? "text-yellow-600" : "text-primary"}`}>
                Free Trial {isExpiringSoon ? "Ending Soon" : "Active"}
              </p>
              <p className="text-sm text-muted-foreground">
                {trialDaysRemaining} days remaining
              </p>
            </div>
          </div>
          <Button variant="outline" size="sm" className="gap-2">
            <Crown className="w-4 h-4" />
            Upgrade Now
          </Button>
        </div>
      </Card>
    );
  }

  // Active paid subscription
  return (
    <Card className="p-4 border-green-500/50 bg-green-500/5">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-green-500/10 flex items-center justify-center">
            <Crown className="w-5 h-5 text-green-600" />
          </div>
          <div>
            <p className="font-medium text-green-600">
              {subscription.plan.charAt(0).toUpperCase() + subscription.plan.slice(1)} Plan
            </p>
            <p className="text-sm text-muted-foreground">
              Valid until {subscription.subscription_ends_at 
                ? new Date(subscription.subscription_ends_at).toLocaleDateString() 
                : "N/A"}
            </p>
          </div>
        </div>
        <Button variant="ghost" size="sm">
          Manage
        </Button>
      </div>
    </Card>
  );
};

export default SubscriptionBanner;
