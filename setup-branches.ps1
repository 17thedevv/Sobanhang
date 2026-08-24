$branches = @(
  "epic-01-auth/us-01-registration-needs",
  "epic-01-auth/us-02-registration-survey",
  "epic-01-auth/us-03-phone-registration",
  "epic-01-auth/us-04-store-setup",
  "epic-01-auth/us-05-feature-suggestions",
  "epic-01-auth/us-06-onboarding-preference",
  "epic-01-auth/us-07-set-password",
  "epic-01-auth/us-08-phone-login",
  "epic-01-auth/us-09-google-login",
  "epic-01-auth/us-10-forgot-password",
  "epic-01-auth/us-11-reset-password",
  "epic-01-auth/us-12-logout",
  "epic-02-dashboard/us-13-daily-overview",
  "epic-02-dashboard/us-14-hide-financial-data",
  "epic-02-dashboard/us-15-edit-shop-name",
  "epic-03-products/us-23-empty-product",
  "epic-03-products/us-24-create-product",
  "epic-03-products/us-25-create-category",
  "epic-03-products/us-26-filter-products",
  "epic-03-products/us-27-product-detail",
  "epic-03-products/us-28-product-fields",
  "epic-03-products/us-29-unit-conversion",
  "epic-04-pos/us-xx-cart",
  "epic-04-pos/us-xx-checkout",
  "epic-05-orders/us-xx-orders"
)

foreach ($branch in $branches) {
  git branch $branch develop
}

git push origin --all
