import { ContentPage } from "@/components/content-page";

export default function PrivacyPolicyScreen() {
  return (
    <ContentPage
      title="Privacy Policy"
      subtitle="Last updated: March 2026. This Privacy Policy explains how ChefMii Ltd collects, uses, and protects your personal information when you use our platform."
      sections={[
        {
          heading: "1. Information We Collect",
          body: "We collect information you provide directly to us, such as your name, email address, phone number, profile photo, home address (for bookings), and payment details. We also collect information automatically when you use our app, including device identifiers, IP address, app usage data, and location data (with your permission).",
        },
        {
          heading: "2. How We Use Your Information",
          body: "We use your information to: create and manage your account; process bookings and payments; connect you with professional chefs; send booking confirmations and updates; improve our services; comply with legal obligations; and send you promotional communications (with your consent, which you may withdraw at any time).",
        },
        {
          heading: "3. Sharing Your Information",
          body: "We share your information with chefs you book (name, address, dietary requirements, and contact details necessary to fulfil your booking); payment processors (Stripe) to handle transactions securely; identity verification providers for chef background checks; and analytics providers to help us improve the platform. We do not sell your personal data to third parties.",
        },
        {
          heading: "4. Data Security",
          body: "We implement industry-standard security measures including encryption in transit (TLS), encrypted storage of sensitive data, and regular security audits. However, no method of transmission over the internet is 100% secure, and we cannot guarantee absolute security.",
        },
        {
          heading: "5. Data Retention",
          body: "We retain your personal data for as long as your account is active or as needed to provide services. You may request deletion of your account and associated data at any time by contacting us at privacy@chefmii.com. Some data may be retained for legal or regulatory purposes.",
        },
        {
          heading: "6. Your Rights",
          body: "Under applicable data protection laws (including the UK GDPR), you have the right to: access your personal data; correct inaccurate data; request deletion of your data; object to or restrict processing; data portability; and withdraw consent at any time. To exercise these rights, contact us at privacy@chefmii.com.",
        },
        {
          heading: "7. Cookies and Tracking",
          body: "Our app uses analytics tools to understand how users interact with ChefMii. These tools may collect anonymised usage data. You can opt out of analytics tracking in your device settings.",
        },
        {
          heading: "8. Children's Privacy",
          body: "ChefMii is not intended for use by individuals under the age of 18. We do not knowingly collect personal information from children. If we become aware that a child has provided us with personal information, we will delete it promptly.",
        },
        {
          heading: "9. Changes to This Policy",
          body: "We may update this Privacy Policy from time to time. We will notify you of significant changes via email or in-app notification. Your continued use of ChefMii after changes become effective constitutes your acceptance of the revised policy.",
        },
        {
          heading: "10. Contact Us",
          body: "If you have any questions about this Privacy Policy or our data practices, please contact us at:\n\nChefMii Ltd\nEmail: privacy@chefmii.com\nAddress: 1 Culinary Square, London, UK",
        },
      ]}
    />
  );
}
