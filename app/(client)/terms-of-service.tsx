import { ContentPage } from "@/components/content-page";

export default function TermsOfServiceScreen() {
  return (
    <ContentPage
      title="Terms of Service"
      subtitle="Last updated: March 2026. By using ChefMii, you agree to these Terms of Service. Please read them carefully."
      sections={[
        {
          heading: "1. About ChefMii",
          body: "ChefMii is a marketplace platform that connects clients with independent professional private chefs for in-home and event dining experiences. ChefMii Ltd acts as an intermediary and is not itself a catering or food service company. Chefs on the platform are independent contractors, not employees of ChefMii.",
        },
        {
          heading: "2. Eligibility",
          body: "You must be at least 18 years of age to use ChefMii. By creating an account, you confirm that you are 18 or older and that all information you provide is accurate and complete.",
        },
        {
          heading: "3. Accounts",
          body: "You are responsible for maintaining the confidentiality of your account credentials and for all activity that occurs under your account. You must notify us immediately of any unauthorised use of your account. ChefMii reserves the right to suspend or terminate accounts that violate these terms.",
        },
        {
          heading: "4. Bookings and Payments",
          body: "When you book a chef, you are entering into a direct agreement with that chef. ChefMii facilitates the booking and payment process but is not a party to the service contract between you and the chef. Payment is processed securely through Stripe. A platform fee of 15% is added to each booking. Payments are held until the chef confirms the booking.",
        },
        {
          heading: "5. Cancellations and Refunds",
          body: "Cancellations made more than 48 hours before the booking date are eligible for a full refund. Cancellations within 48 hours may be subject to a cancellation fee of up to 50% of the booking value. No-shows will not be refunded. Chefs who cancel bookings without adequate notice may have their accounts suspended.",
        },
        {
          heading: "6. Chef Verification",
          body: "ChefMii requires chefs to complete a 3-stage verification process including identity verification, culinary credentials review, and food safety certification. While we take reasonable steps to verify chefs, ChefMii does not guarantee the accuracy of information provided by chefs and is not liable for any harm arising from a chef's services.",
        },
        {
          heading: "7. User Conduct",
          body: "You agree not to: use ChefMii for any unlawful purpose; post false or misleading information; harass, abuse, or harm other users; attempt to circumvent the platform to book chefs directly and avoid platform fees; or interfere with the proper functioning of the platform.",
        },
        {
          heading: "8. Reviews and Ratings",
          body: "Reviews must be honest and based on your genuine experience. ChefMii reserves the right to remove reviews that are fraudulent, abusive, or violate our community guidelines. Chefs may not offer incentives in exchange for positive reviews.",
        },
        {
          heading: "9. Limitation of Liability",
          body: "To the maximum extent permitted by law, ChefMii shall not be liable for any indirect, incidental, special, or consequential damages arising from your use of the platform or the services of any chef booked through ChefMii. Our total liability to you shall not exceed the amount you paid for the relevant booking.",
        },
        {
          heading: "10. Governing Law",
          body: "These Terms are governed by the laws of England and Wales. Any disputes shall be subject to the exclusive jurisdiction of the courts of England and Wales.",
        },
        {
          heading: "11. Changes to Terms",
          body: "We may update these Terms from time to time. We will notify you of material changes via email or in-app notification. Continued use of ChefMii after changes take effect constitutes acceptance of the revised Terms.",
        },
        {
          heading: "12. Contact",
          body: "For questions about these Terms, contact us at:\n\nChefMii Ltd\nEmail: legal@chefmii.com\nAddress: 1 Culinary Square, London, UK",
        },
      ]}
    />
  );
}
