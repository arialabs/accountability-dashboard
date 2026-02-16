import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Privacy Policy",
  description: "Privacy policy for Accountability Dashboard - how we collect, use, and protect your data.",
};

export default function PrivacyPage() {
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <h1 className="text-4xl font-bold text-slate-900 mb-4">Privacy Policy</h1>
      <p className="text-sm text-slate-600 mb-8">Last Updated: February 15, 2026</p>

      <div className="prose prose-slate max-w-none space-y-8">
        <section>
          <h2 className="text-2xl font-semibold text-slate-900 mb-4">Introduction</h2>
          <p className="text-slate-700 leading-relaxed">
            Accountability Dashboard ("we," "our," or "us") is committed to protecting your privacy. 
            This Privacy Policy explains how we collect, use, and safeguard information when you use 
            our government transparency platform at reps.arialabs.ai (the "Site").
          </p>
          <p className="text-slate-700 leading-relaxed mt-4">
            <strong>Our core principle:</strong> We collect minimal data, use only public information 
            sources, and have no user accounts or login requirements.
          </p>
        </section>

        <section>
          <h2 className="text-2xl font-semibold text-slate-900 mb-4">Information We Collect</h2>
          
          <h3 className="text-xl font-semibold text-slate-800 mb-3">Information You Provide</h3>
          <p className="text-slate-700 leading-relaxed">
            We do not require user accounts or logins. You may voluntarily provide contact information 
            if you reach out to us via email for support, fact-checking inquiries, or feedback.
          </p>

          <h3 className="text-xl font-semibold text-slate-800 mb-3 mt-6">Automatically Collected Information</h3>
          <p className="text-slate-700 leading-relaxed">
            When you visit the Site, we may automatically collect:
          </p>
          <ul className="list-disc list-inside text-slate-700 leading-relaxed ml-4 mt-2 space-y-2">
            <li><strong>Usage Data:</strong> Pages viewed, time spent, browser type, device type, and referring URLs</li>
            <li><strong>Technical Data:</strong> IP address (anonymized), approximate geographic location (country/region)</li>
            <li><strong>Cookies:</strong> Essential cookies for site functionality and optional analytics cookies</li>
          </ul>
        </section>

        <section>
          <h2 className="text-2xl font-semibold text-slate-900 mb-4">How We Use Your Information</h2>
          <p className="text-slate-700 leading-relaxed">We use collected information to:</p>
          <ul className="list-disc list-inside text-slate-700 leading-relaxed ml-4 mt-2 space-y-2">
            <li>Operate and maintain the Site</li>
            <li>Improve user experience and site performance</li>
            <li>Analyze traffic patterns and usage trends (aggregated, anonymous data)</li>
            <li>Respond to user inquiries and support requests</li>
            <li>Detect and prevent technical issues, abuse, or security threats</li>
          </ul>
        </section>

        <section>
          <h2 className="text-2xl font-semibold text-slate-900 mb-4">Cookies and Tracking Technologies</h2>
          <p className="text-slate-700 leading-relaxed">
            We use cookies to enhance your browsing experience:
          </p>
          <ul className="list-disc list-inside text-slate-700 leading-relaxed ml-4 mt-2 space-y-2">
            <li><strong>Essential Cookies:</strong> Required for basic site functionality (cannot be disabled)</li>
            <li><strong>Analytics Cookies:</strong> Optional cookies that help us understand how visitors use the Site (Cloudflare Analytics with anonymized IPs)</li>
          </ul>
          <p className="text-slate-700 leading-relaxed mt-4">
            You can control cookie preferences through your browser settings. Disabling essential cookies may 
            limit site functionality.
          </p>
        </section>

        <section>
          <h2 className="text-2xl font-semibold text-slate-900 mb-4">Third-Party Services</h2>
          <p className="text-slate-700 leading-relaxed">
            We use the following third-party services:
          </p>
          <ul className="list-disc list-inside text-slate-700 leading-relaxed ml-4 mt-2 space-y-2">
            <li>
              <strong>Cloudflare:</strong> Content delivery, DDoS protection, and basic analytics (anonymized)
              <br />
              <a href="https://www.cloudflare.com/privacypolicy/" className="text-blue-600 hover:underline" target="_blank" rel="noopener noreferrer">Cloudflare Privacy Policy</a>
            </li>
            <li>
              <strong>GitHub Pages:</strong> Site hosting
              <br />
              <a href="https://docs.github.com/en/site-policy/privacy-policies/github-privacy-statement" className="text-blue-600 hover:underline" target="_blank" rel="noopener noreferrer">GitHub Privacy Statement</a>
            </li>
          </ul>
          <p className="text-slate-700 leading-relaxed mt-4">
            We do not share personal data with third parties for marketing purposes.
          </p>
        </section>

        <section>
          <h2 className="text-2xl font-semibold text-slate-900 mb-4">Public Data Sources</h2>
          <p className="text-slate-700 leading-relaxed">
            All political data displayed on this Site is sourced from publicly available government databases:
          </p>
          <ul className="list-disc list-inside text-slate-700 leading-relaxed ml-4 mt-2 space-y-2">
            <li>Congress.gov (legislative data)</li>
            <li>Federal Election Commission (FEC) (campaign finance)</li>
            <li>OpenSecrets.org (lobbying and donor data)</li>
            <li>Voteview.com (voting records)</li>
            <li>Supreme Court official records</li>
          </ul>
          <p className="text-slate-700 leading-relaxed mt-4">
            We do not collect, store, or monetize personal data about elected officials beyond what is 
            already public record.
          </p>
        </section>

        <section>
          <h2 className="text-2xl font-semibold text-slate-900 mb-4">Data Retention</h2>
          <p className="text-slate-700 leading-relaxed">
            We retain usage data for up to 90 days for analytics purposes. After that, data is either 
            deleted or aggregated into anonymized statistics.
          </p>
        </section>

        <section>
          <h2 className="text-2xl font-semibold text-slate-900 mb-4">Your Rights</h2>
          <p className="text-slate-700 leading-relaxed">
            Depending on your location, you may have the following rights:
          </p>
          <ul className="list-disc list-inside text-slate-700 leading-relaxed ml-4 mt-2 space-y-2">
            <li><strong>Access:</strong> Request a copy of data we have about you</li>
            <li><strong>Deletion:</strong> Request deletion of your data</li>
            <li><strong>Opt-Out:</strong> Opt out of analytics cookies via browser settings</li>
          </ul>
          <p className="text-slate-700 leading-relaxed mt-4">
            To exercise these rights, contact us at{" "}
            <a href="mailto:privacy@arialabs.ai" className="text-blue-600 hover:underline">
              privacy@arialabs.ai
            </a>
          </p>
        </section>

        <section>
          <h2 className="text-2xl font-semibold text-slate-900 mb-4">Security</h2>
          <p className="text-slate-700 leading-relaxed">
            We use industry-standard security measures to protect your data:
          </p>
          <ul className="list-disc list-inside text-slate-700 leading-relaxed ml-4 mt-2 space-y-2">
            <li>HTTPS encryption for all traffic</li>
            <li>Regular security audits and updates</li>
            <li>Cloudflare DDoS protection and Web Application Firewall (WAF)</li>
          </ul>
          <p className="text-slate-700 leading-relaxed mt-4">
            However, no internet transmission is 100% secure. We cannot guarantee absolute security.
          </p>
        </section>

        <section>
          <h2 className="text-2xl font-semibold text-slate-900 mb-4">Children's Privacy</h2>
          <p className="text-slate-700 leading-relaxed">
            The Site is not directed at children under 13. We do not knowingly collect personal information 
            from children. If you believe we have inadvertently collected such data, contact us immediately 
            at{" "}
            <a href="mailto:privacy@arialabs.ai" className="text-blue-600 hover:underline">
              privacy@arialabs.ai
            </a>
          </p>
        </section>

        <section>
          <h2 className="text-2xl font-semibold text-slate-900 mb-4">Changes to This Policy</h2>
          <p className="text-slate-700 leading-relaxed">
            We may update this Privacy Policy from time to time. Changes will be posted on this page with 
            an updated "Last Updated" date. Continued use of the Site after changes constitutes acceptance 
            of the revised policy.
          </p>
        </section>

        <section>
          <h2 className="text-2xl font-semibold text-slate-900 mb-4">Contact Us</h2>
          <p className="text-slate-700 leading-relaxed">
            If you have questions about this Privacy Policy, contact us at:
          </p>
          <p className="text-slate-700 leading-relaxed mt-4">
            <strong>Email:</strong>{" "}
            <a href="mailto:privacy@arialabs.ai" className="text-blue-600 hover:underline">
              privacy@arialabs.ai
            </a>
            <br />
            <strong>Mailing Address:</strong> Aria Labs, [Address to be provided]
          </p>
        </section>
      </div>
    </div>
  );
}
