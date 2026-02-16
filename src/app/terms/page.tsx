import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Terms of Service",
  description: "Terms of Service for Accountability Dashboard - rules and guidelines for using our platform.",
};

export default function TermsPage() {
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <h1 className="text-4xl font-bold text-slate-900 mb-4">Terms of Service</h1>
      <p className="text-sm text-slate-600 mb-8">Last Updated: February 15, 2026</p>

      <div className="prose prose-slate max-w-none space-y-8">
        <section>
          <h2 className="text-2xl font-semibold text-slate-900 mb-4">1. Acceptance of Terms</h2>
          <p className="text-slate-700 leading-relaxed">
            By accessing or using Accountability Dashboard ("the Site") at reps.arialabs.ai, you agree to 
            be bound by these Terms of Service ("Terms"). If you do not agree to these Terms, do not use the Site.
          </p>
          <p className="text-slate-700 leading-relaxed mt-4">
            These Terms constitute a legally binding agreement between you and Aria Labs ("we," "our," or "us").
          </p>
        </section>

        <section>
          <h2 className="text-2xl font-semibold text-slate-900 mb-4">2. Description of Service</h2>
          <p className="text-slate-700 leading-relaxed">
            Accountability Dashboard is a public transparency platform that tracks the actions of U.S. 
            government officials across all three branches (Legislative, Executive, and Judicial). We provide:
          </p>
          <ul className="list-disc list-inside text-slate-700 leading-relaxed ml-4 mt-2 space-y-2">
            <li>Voting records, campaign finance data, and alignment scores for members of Congress</li>
            <li>Executive branch tracking (presidential actions, cabinet activity)</li>
            <li>Supreme Court and federal judiciary monitoring</li>
            <li>Deep-dive investigations into government accountability issues</li>
          </ul>
          <p className="text-slate-700 leading-relaxed mt-4">
            All data is sourced from publicly available government databases and open-source research.
          </p>
        </section>

        <section>
          <h2 className="text-2xl font-semibold text-slate-900 mb-4">3. Acceptable Use Policy</h2>
          <p className="text-slate-700 leading-relaxed">You agree NOT to:</p>
          <ul className="list-disc list-inside text-slate-700 leading-relaxed ml-4 mt-2 space-y-2">
            <li>Use the Site for any illegal purpose or to violate any laws</li>
            <li>Attempt to gain unauthorized access to the Site, servers, or databases</li>
            <li>Use automated tools (bots, scrapers) to extract data without permission</li>
            <li>Harass, threaten, or incite violence against any individual or group</li>
            <li>Misrepresent data or create misleading narratives from our information</li>
            <li>Interfere with or disrupt the Site's operation or servers</li>
            <li>Use the Site to distribute malware, spam, or phishing content</li>
          </ul>
          <p className="text-slate-700 leading-relaxed mt-4">
            Violation of this policy may result in termination of access and legal action.
          </p>
        </section>

        <section>
          <h2 className="text-2xl font-semibold text-slate-900 mb-4">4. Content Disclaimers</h2>
          
          <h3 className="text-xl font-semibold text-slate-800 mb-3">Not Legal or Financial Advice</h3>
          <p className="text-slate-700 leading-relaxed">
            The Site provides informational content only. Nothing on this Site constitutes:
          </p>
          <ul className="list-disc list-inside text-slate-700 leading-relaxed ml-4 mt-2 space-y-2">
            <li>Legal advice or recommendations</li>
            <li>Financial or investment advice</li>
            <li>Political endorsements or campaign contributions</li>
          </ul>
          <p className="text-slate-700 leading-relaxed mt-4">
            Consult qualified professionals for legal, financial, or political advice.
          </p>

          <h3 className="text-xl font-semibold text-slate-800 mb-3 mt-6">Accuracy of Information</h3>
          <p className="text-slate-700 leading-relaxed">
            We strive for accuracy but cannot guarantee that all data is complete, current, or error-free. 
            Government data sources may contain errors or delays. We are not responsible for decisions made 
            based on information from this Site.
          </p>

          <h3 className="text-xl font-semibold text-slate-800 mb-3 mt-6">Third-Party Content</h3>
          <p className="text-slate-700 leading-relaxed">
            The Site may link to third-party websites or display data from external sources. We do not 
            endorse or take responsibility for third-party content.
          </p>
        </section>

        <section>
          <h2 className="text-2xl font-semibold text-slate-900 mb-4">5. Intellectual Property Rights</h2>
          
          <h3 className="text-xl font-semibold text-slate-800 mb-3">Our Content</h3>
          <p className="text-slate-700 leading-relaxed">
            Unless otherwise stated, all original content on this Site (analysis, commentary, design, code) 
            is © 2026 Aria Labs and licensed under the{" "}
            <a href="https://opensource.org/licenses/MIT" className="text-blue-600 hover:underline" target="_blank" rel="noopener noreferrer">
              MIT License
            </a>.
          </p>

          <h3 className="text-xl font-semibold text-slate-800 mb-3 mt-6">Public Domain Data</h3>
          <p className="text-slate-700 leading-relaxed">
            Government data (voting records, campaign finance, official photos) is in the public domain and 
            is not subject to copyright restrictions.
          </p>

          <h3 className="text-xl font-semibold text-slate-800 mb-3 mt-6">Open Source Code</h3>
          <p className="text-slate-700 leading-relaxed">
            The Site's source code is available at{" "}
            <a href="https://github.com/jeremyspofford/accountability-dashboard" className="text-blue-600 hover:underline" target="_blank" rel="noopener noreferrer">
              github.com/jeremyspofford/accountability-dashboard
            </a>{" "}
            under the MIT License. You may use, modify, and distribute the code subject to the license terms.
          </p>

          <h3 className="text-xl font-semibold text-slate-800 mb-3 mt-6">Trademarks</h3>
          <p className="text-slate-700 leading-relaxed">
            "Accountability Dashboard" and the Aria Labs logo are trademarks of Aria Labs. Unauthorized use 
            is prohibited.
          </p>
        </section>

        <section>
          <h2 className="text-2xl font-semibold text-slate-900 mb-4">6. DMCA and Copyright Infringement</h2>
          <p className="text-slate-700 leading-relaxed">
            We respect intellectual property rights. If you believe content on this Site infringes your 
            copyright, submit a DMCA takedown notice to:
          </p>
          <p className="text-slate-700 leading-relaxed mt-4">
            <strong>Email:</strong>{" "}
            <a href="mailto:dmca@arialabs.ai" className="text-blue-600 hover:underline">
              dmca@arialabs.ai
            </a>
          </p>
          <p className="text-slate-700 leading-relaxed mt-4">
            Your notice must include:
          </p>
          <ul className="list-disc list-inside text-slate-700 leading-relaxed ml-4 mt-2 space-y-2">
            <li>Identification of the copyrighted work claimed to be infringed</li>
            <li>URL or location of the infringing material on our Site</li>
            <li>Your contact information (name, email, phone)</li>
            <li>A statement that you have a good faith belief the use is unauthorized</li>
            <li>A statement under penalty of perjury that the information is accurate</li>
            <li>Your physical or electronic signature</li>
          </ul>
          <p className="text-slate-700 leading-relaxed mt-4">
            Counter-notifications may be submitted if you believe content was removed in error.
          </p>
        </section>

        <section>
          <h2 className="text-2xl font-semibold text-slate-900 mb-4">7. Limitation of Liability</h2>
          <p className="text-slate-700 leading-relaxed">
            To the fullest extent permitted by law, Aria Labs and its affiliates, officers, employees, and 
            contributors shall NOT be liable for:
          </p>
          <ul className="list-disc list-inside text-slate-700 leading-relaxed ml-4 mt-2 space-y-2">
            <li>Indirect, incidental, special, consequential, or punitive damages</li>
            <li>Loss of profits, data, use, goodwill, or other intangible losses</li>
            <li>Damages resulting from errors, inaccuracies, or omissions in data</li>
            <li>Unauthorized access to or use of our servers</li>
            <li>Interruptions or cessation of the Site</li>
          </ul>
          <p className="text-slate-700 leading-relaxed mt-4">
            <strong>Use at your own risk.</strong> The Site is provided "AS IS" and "AS AVAILABLE" without 
            warranties of any kind, express or implied.
          </p>
        </section>

        <section>
          <h2 className="text-2xl font-semibold text-slate-900 mb-4">8. Indemnification</h2>
          <p className="text-slate-700 leading-relaxed">
            You agree to indemnify, defend, and hold harmless Aria Labs from any claims, liabilities, damages, 
            losses, or expenses (including legal fees) arising from:
          </p>
          <ul className="list-disc list-inside text-slate-700 leading-relaxed ml-4 mt-2 space-y-2">
            <li>Your use of the Site</li>
            <li>Your violation of these Terms</li>
            <li>Your violation of any third-party rights</li>
          </ul>
        </section>

        <section>
          <h2 className="text-2xl font-semibold text-slate-900 mb-4">9. Termination</h2>
          <p className="text-slate-700 leading-relaxed">
            We reserve the right to suspend or terminate your access to the Site at any time, without notice, 
            for conduct that we believe:
          </p>
          <ul className="list-disc list-inside text-slate-700 leading-relaxed ml-4 mt-2 space-y-2">
            <li>Violates these Terms or applicable laws</li>
            <li>Harms other users or the Site's operation</li>
            <li>Exposes us to legal liability</li>
          </ul>
          <p className="text-slate-700 leading-relaxed mt-4">
            Upon termination, all provisions of these Terms that by their nature should survive termination 
            (including disclaimers, indemnification, and limitations of liability) shall remain in effect.
          </p>
        </section>

        <section>
          <h2 className="text-2xl font-semibold text-slate-900 mb-4">10. Governing Law and Dispute Resolution</h2>
          <p className="text-slate-700 leading-relaxed">
            These Terms are governed by the laws of the State of [STATE] and the United States, without 
            regard to conflict of law principles.
          </p>
          <p className="text-slate-700 leading-relaxed mt-4">
            Any disputes arising from these Terms or your use of the Site shall be resolved through binding 
            arbitration in accordance with the American Arbitration Association (AAA) rules, except that 
            small claims (under $10,000) may be filed in small claims court.
          </p>
          <p className="text-slate-700 leading-relaxed mt-4">
            <strong>Class Action Waiver:</strong> You agree to resolve disputes individually and waive the 
            right to participate in class actions or class arbitrations.
          </p>
        </section>

        <section>
          <h2 className="text-2xl font-semibold text-slate-900 mb-4">11. Changes to These Terms</h2>
          <p className="text-slate-700 leading-relaxed">
            We may modify these Terms at any time. Changes will be posted on this page with an updated 
            "Last Updated" date. Material changes will be communicated via a notice on the homepage.
          </p>
          <p className="text-slate-700 leading-relaxed mt-4">
            Continued use of the Site after changes constitutes acceptance of the revised Terms.
          </p>
        </section>

        <section>
          <h2 className="text-2xl font-semibold text-slate-900 mb-4">12. Severability</h2>
          <p className="text-slate-700 leading-relaxed">
            If any provision of these Terms is found to be invalid or unenforceable, the remaining provisions 
            will continue in full force and effect.
          </p>
        </section>

        <section>
          <h2 className="text-2xl font-semibold text-slate-900 mb-4">13. Contact Information</h2>
          <p className="text-slate-700 leading-relaxed">
            For questions about these Terms, contact us at:
          </p>
          <p className="text-slate-700 leading-relaxed mt-4">
            <strong>Email:</strong>{" "}
            <a href="mailto:legal@arialabs.ai" className="text-blue-600 hover:underline">
              legal@arialabs.ai
            </a>
            <br />
            <strong>Mailing Address:</strong> Aria Labs, [Address to be provided]
          </p>
        </section>

        <section className="bg-slate-100 p-6 rounded-lg mt-8">
          <h2 className="text-2xl font-semibold text-slate-900 mb-4">14. Entire Agreement</h2>
          <p className="text-slate-700 leading-relaxed">
            These Terms, together with our Privacy Policy, constitute the entire agreement between you and 
            Aria Labs regarding your use of the Site and supersede all prior agreements and understandings.
          </p>
        </section>
      </div>
    </div>
  );
}
