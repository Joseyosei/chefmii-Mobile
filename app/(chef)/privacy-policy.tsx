import { ContentPage } from "@/components/content-page";

export default function ChefPrivacyPolicyScreen() {
  return (
    <ContentPage
      title="Privacy Policy"
      subtitle="Last updated: March 2026. This Privacy Policy explains how ChefMii Ltd collects, uses, and protects your personal information when you use our platform as a chef."
      sections={[
        { heading: "1. Information We Collect", body: "We collect information you provide directly to us, such as your name, email address, phone number, profile photo, location, culinary credentials, food safety certificates, government-issued ID (for verification), and bank account details (for payouts). We also collect information automatically when you use our app, including device identifiers, IP address, and app usage data." },
        { heading: "2. How We Use Your Information", body: "We use your information to: create and manage your chef account; verify your identity and credentials; process payouts to your bank account; display your profile to potential clients; send booking notifications and updates; improve our services; and comply with legal obligations." },
        { heading: "3. Sharing Your Information", body: "We share your name, profile, and contact details with clients who book you. We share your identity documents with our verification partners (securely and confidentially). We share payout information with our payment processor (Stripe). We do not sell your personal data to third parties." },
        { heading: "4. Data Security", body: "We implement industry-standard security measures including encryption in transit (TLS), encrypted storage of sensitive documents, and regular security audits. Uploaded documents are stored in secure, access-controlled cloud storage." },
        { heading: "5. Your Rights", body: "Under applicable data protection laws (including the UK GDPR), you have the right to access, correct, or delete your personal data. To exercise these rights, contact us at privacy@chefmii.com." },
        { heading: "6. Contact Us", body: "ChefMii Ltd\nEmail: privacy@chefmii.com\nAddress: 1 Culinary Square, London, UK" },
      ]}
    />
  );
}
