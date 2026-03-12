import { ContentPage } from "@/components/content-page";

export default function ChefTermsOfServiceScreen() {
  return (
    <ContentPage
      title="Terms of Service"
      subtitle="Last updated: March 2026. These terms govern your use of ChefMii as a chef. By registering as a chef, you agree to these terms."
      sections={[
        { heading: "1. Chef Status", body: "You are an independent contractor, not an employee of ChefMii. You are responsible for your own taxes, insurance, and compliance with food safety regulations. ChefMii provides a platform to connect you with clients." },
        { heading: "2. Verification Requirements", body: "You must complete all 3 stages of chef verification (identity, culinary credentials, food safety certificate) before accepting bookings. Providing false or misleading information during verification will result in immediate account suspension." },
        { heading: "3. Bookings and Conduct", body: "When you accept a booking, you enter into a direct service agreement with the client. You must arrive on time, deliver the agreed menu, maintain professional conduct, and leave the kitchen clean. Repeated cancellations or no-shows will result in account suspension." },
        { heading: "4. Payments and Fees", body: "ChefMii charges a 15% platform fee on each booking. Your earnings (85% of the package price) are transferred to your registered bank account within 3-5 business days after the booking is completed. Payouts are processed through Stripe." },
        { heading: "5. Reviews", body: "Clients may leave reviews after each booking. You may not offer incentives for positive reviews or attempt to manipulate the review system. ChefMii may remove reviews that violate our guidelines." },
        { heading: "6. Intellectual Property", body: "By uploading photos or content to ChefMii, you grant us a non-exclusive licence to display that content on the platform for promotional purposes." },
        { heading: "7. Contact", body: "ChefMii Ltd\nEmail: chefs@chefmii.com\nAddress: 1 Culinary Square, London, UK" },
      ]}
    />
  );
}
