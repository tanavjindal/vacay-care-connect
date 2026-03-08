import Header from "@/components/layout/Header";
import { Link } from "react-router-dom";
import { Shield, Lock, Eye, Trash2, Download, Bell } from "lucide-react";

const PrivacyPolicy = () => {
  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="pt-24 pb-16">
        <div className="container mx-auto px-4 max-w-4xl">
          <div className="mb-12">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 text-primary text-sm font-medium mb-6">
              <Shield className="w-4 h-4" />
              Legal Document
            </div>
            <h1 className="text-4xl md:text-5xl font-bold mb-4">Privacy Policy</h1>
            <p className="text-muted-foreground text-lg">
              Last updated: March 8, 2026 · Effective: March 8, 2026
            </p>
          </div>

          <div className="prose prose-lg max-w-none space-y-10">
            {/* Introduction */}
            <section>
              <h2 className="text-2xl font-bold text-foreground flex items-center gap-2">
                <Shield className="w-6 h-6 text-primary" />
                1. Introduction
              </h2>
              <p className="text-muted-foreground leading-relaxed">
                Translatical ("we," "our," or "us") is committed to protecting your personal data and respecting your privacy. This Privacy Policy explains how we collect, use, store, and protect your information when you use our medical translation platform, in compliance with the <strong>Digital Personal Data Protection Act, 2023 (DPDPA)</strong> of India and applicable international privacy regulations.
              </p>
              <p className="text-muted-foreground leading-relaxed">
                By using Translatical, you acknowledge that you have read and understood this Privacy Policy. If you do not agree with our practices, please do not use our services.
              </p>
            </section>

            {/* Data We Collect */}
            <section>
              <h2 className="text-2xl font-bold text-foreground flex items-center gap-2">
                <Eye className="w-6 h-6 text-primary" />
                2. Data We Collect
              </h2>
              
              <h3 className="text-xl font-semibold text-foreground mt-6">2.1 Personal Data</h3>
              <ul className="text-muted-foreground space-y-2">
                <li>Full name and display name</li>
                <li>Email address</li>
                <li>Phone number (optional)</li>
                <li>City and address (optional)</li>
                <li>Preferred language</li>
              </ul>

              <h3 className="text-xl font-semibold text-foreground mt-6">2.2 Sensitive Personal Data (Health Data)</h3>
              <p className="text-muted-foreground leading-relaxed">
                Under DPDPA Section 2(c), health data is classified as <strong>Sensitive Personal Data</strong>. We collect:
              </p>
              <ul className="text-muted-foreground space-y-2">
                <li>Medical records and prescriptions you upload</li>
                <li>Blood type, allergies, and chronic conditions</li>
                <li>Date of birth</li>
                <li>Emergency contact information</li>
                <li>National ID (for patient identification only)</li>
              </ul>

              <h3 className="text-xl font-semibold text-foreground mt-6">2.3 Automatically Collected Data</h3>
              <ul className="text-muted-foreground space-y-2">
                <li>IP address (for consent logging)</li>
                <li>Browser type and device information</li>
                <li>Usage patterns and feature interactions</li>
              </ul>
            </section>

            {/* How We Use Your Data */}
            <section>
              <h2 className="text-2xl font-bold text-foreground">3. Purpose of Data Processing</h2>
              <p className="text-muted-foreground leading-relaxed">
                We process your data strictly for the following purposes, as required by DPDPA Section 4:
              </p>
              <ul className="text-muted-foreground space-y-2">
                <li><strong>Medical Translation:</strong> Translating your medical records and facilitating communication with healthcare providers</li>
                <li><strong>Patient Identification:</strong> Generating QR codes to enable hospital staff to access your records with your consent</li>
                <li><strong>AI-Powered Assistance:</strong> Providing mental health support and translation services using AI models</li>
                <li><strong>Account Management:</strong> Managing your profile and preferences</li>
                <li><strong>Legal Compliance:</strong> Maintaining audit logs of data access as required by law</li>
              </ul>
            </section>

            {/* Consent */}
            <section>
              <h2 className="text-2xl font-bold text-foreground">4. Consent (DPDPA Section 6)</h2>
              <p className="text-muted-foreground leading-relaxed">
                We obtain your <strong>explicit, informed, and freely given consent</strong> before processing any sensitive personal data. You will be asked to:
              </p>
              <ul className="text-muted-foreground space-y-2">
                <li>Sign a digital consent form before accessing medical features</li>
                <li>Acknowledge that hospital staff may access your records via QR code</li>
                <li>Agree to AI processing of your medical information for translation purposes</li>
              </ul>
              <p className="text-muted-foreground leading-relaxed">
                You may <strong>withdraw consent at any time</strong> by contacting us at <a href="mailto:privacy@translatical.com" className="text-primary hover:underline">privacy@translatical.com</a>. Withdrawal of consent does not affect the lawfulness of processing done prior to withdrawal.
              </p>
            </section>

            {/* Data Storage & Security */}
            <section>
              <h2 className="text-2xl font-bold text-foreground flex items-center gap-2">
                <Lock className="w-6 h-6 text-primary" />
                5. Data Storage & Security
              </h2>
              <p className="text-muted-foreground leading-relaxed">
                We implement industry-standard security measures to protect your data:
              </p>
              <ul className="text-muted-foreground space-y-2">
                <li><strong>Encryption:</strong> All data is encrypted in transit (TLS 1.3) and at rest (AES-256)</li>
                <li><strong>Access Control:</strong> Row-Level Security (RLS) policies ensure users can only access their own data</li>
                <li><strong>Authentication:</strong> Multi-factor authentication support with email verification</li>
                <li><strong>Audit Logging:</strong> All access to patient data by hospital staff is logged with timestamps</li>
                <li><strong>Role-Based Access:</strong> Hospital staff must be authorized by hospital administrators before accessing patient records</li>
                <li><strong>Data Minimization:</strong> We only collect data necessary for providing our services</li>
              </ul>
            </section>

            {/* Data Sharing */}
            <section>
              <h2 className="text-2xl font-bold text-foreground">6. Data Sharing & Third Parties</h2>
              <p className="text-muted-foreground leading-relaxed">
                We do <strong>not sell your personal data</strong>. We share data only in these limited circumstances:
              </p>
              <ul className="text-muted-foreground space-y-2">
                <li><strong>Healthcare Providers:</strong> Hospital staff can access your records only after scanning your QR code, with your consent, and all access is logged</li>
                <li><strong>AI Service Providers:</strong> We use AI models for translation and therapy features. Your data is processed but not stored by these providers</li>
                <li><strong>Legal Requirements:</strong> When required by Indian law, court orders, or regulatory authorities</li>
              </ul>
            </section>

            {/* Your Rights */}
            <section>
              <h2 className="text-2xl font-bold text-foreground flex items-center gap-2">
                <Download className="w-6 h-6 text-primary" />
                7. Your Rights Under DPDPA
              </h2>
              <p className="text-muted-foreground leading-relaxed">
                As a Data Principal under DPDPA, you have the following rights:
              </p>
              <ul className="text-muted-foreground space-y-3">
                <li><strong>Right to Access (Section 11):</strong> Request a summary of your personal data and processing activities</li>
                <li><strong>Right to Correction (Section 12):</strong> Request correction of inaccurate or incomplete data</li>
                <li><strong>Right to Erasure (Section 13):</strong> Request deletion of your personal data, subject to legal retention requirements</li>
                <li><strong>Right to Grievance Redressal (Section 14):</strong> File complaints about data processing</li>
                <li><strong>Right to Nominate (Section 15):</strong> Nominate a person to exercise your rights in case of incapacity or death</li>
              </ul>
              <p className="text-muted-foreground leading-relaxed">
                To exercise any of these rights, contact our Data Protection Officer at <a href="mailto:dpo@translatical.com" className="text-primary hover:underline">dpo@translatical.com</a>.
              </p>
            </section>

            {/* Data Retention */}
            <section>
              <h2 className="text-2xl font-bold text-foreground flex items-center gap-2">
                <Trash2 className="w-6 h-6 text-primary" />
                8. Data Retention
              </h2>
              <ul className="text-muted-foreground space-y-2">
                <li>Personal data is retained as long as your account is active</li>
                <li>Medical records are retained until you request deletion</li>
                <li>Consent records are retained for 5 years after consent withdrawal (legal requirement)</li>
                <li>Audit logs are retained for 3 years (regulatory compliance)</li>
                <li>Upon account deletion, all personal data is erased within 30 days, except where legally required</li>
              </ul>
            </section>

            {/* Children's Data */}
            <section>
              <h2 className="text-2xl font-bold text-foreground">9. Children's Data (DPDPA Section 9)</h2>
              <p className="text-muted-foreground leading-relaxed">
                Translatical does not knowingly process data of children under 18 without verifiable consent from a parent or legal guardian. If you believe a child has provided data without guardian consent, contact us immediately for deletion.
              </p>
            </section>

            {/* Cross-Border Transfer */}
            <section>
              <h2 className="text-2xl font-bold text-foreground">10. Cross-Border Data Transfer</h2>
              <p className="text-muted-foreground leading-relaxed">
                Your data may be processed on servers located outside India for the purposes of cloud computing and AI translation services. We ensure that any cross-border transfer complies with DPDPA Section 16 and is made only to jurisdictions not restricted by the Central Government. Appropriate contractual safeguards are in place with all service providers.
              </p>
            </section>

            {/* Breach Notification */}
            <section>
              <h2 className="text-2xl font-bold text-foreground flex items-center gap-2">
                <Bell className="w-6 h-6 text-primary" />
                11. Data Breach Notification
              </h2>
              <p className="text-muted-foreground leading-relaxed">
                In the event of a personal data breach, we will:
              </p>
              <ul className="text-muted-foreground space-y-2">
                <li>Notify the Data Protection Board of India within 72 hours</li>
                <li>Notify affected users without unreasonable delay</li>
                <li>Take immediate measures to contain and remediate the breach</li>
                <li>Maintain a complete record of all breaches for regulatory review</li>
              </ul>
            </section>

            {/* Medical Disclaimer */}
            <section className="bg-destructive/5 border border-destructive/20 rounded-xl p-6">
              <h2 className="text-2xl font-bold text-foreground">12. Medical Disclaimer</h2>
              <p className="text-muted-foreground leading-relaxed">
                Translatical is a <strong>medical translation and communication tool</strong>. It is <strong>NOT</strong> a substitute for professional medical advice, diagnosis, or treatment. All AI-generated translations and therapeutic conversations are for informational purposes only. Always consult qualified healthcare providers for medical decisions. We assume no liability for medical outcomes based on translations provided through our platform.
              </p>
            </section>

            {/* Grievance Officer */}
            <section>
              <h2 className="text-2xl font-bold text-foreground">13. Grievance Officer</h2>
              <p className="text-muted-foreground leading-relaxed">
                In accordance with DPDPA Section 14, our Grievance Officer can be contacted at:
              </p>
              <div className="bg-muted/50 rounded-xl p-6 mt-4">
                <p className="text-foreground font-medium">Translatical Data Protection Officer</p>
                <p className="text-muted-foreground">Email: <a href="mailto:dpo@translatical.com" className="text-primary hover:underline">dpo@translatical.com</a></p>
                <p className="text-muted-foreground">Response time: Within 30 days of receipt</p>
              </div>
            </section>

            {/* Changes */}
            <section>
              <h2 className="text-2xl font-bold text-foreground">14. Changes to This Policy</h2>
              <p className="text-muted-foreground leading-relaxed">
                We may update this Privacy Policy periodically. Changes will be posted on this page with an updated "Last modified" date. For significant changes, we will notify you via email or an in-app notification. Continued use of Translatical after changes constitutes acceptance of the updated policy.
              </p>
            </section>
          </div>

          <div className="mt-12 pt-8 border-t border-border/50 text-center">
            <p className="text-sm text-muted-foreground">
              Have questions? Contact us at{" "}
              <a href="mailto:privacy@translatical.com" className="text-primary hover:underline">privacy@translatical.com</a>
            </p>
            <div className="flex items-center justify-center gap-4 mt-4">
              <Link to="/terms" className="text-sm text-primary hover:underline">Terms of Service</Link>
              <span className="text-muted-foreground">·</span>
              <Link to="/" className="text-sm text-primary hover:underline">Back to Home</Link>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default PrivacyPolicy;
