import Header from "@/components/layout/Header";
import { Link } from "react-router-dom";
import { FileText, AlertTriangle, Scale, Globe, CreditCard, ShieldAlert } from "lucide-react";

const TermsOfService = () => {
  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="pt-24 pb-16">
        <div className="container mx-auto px-4 max-w-4xl">
          <div className="mb-12">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 text-primary text-sm font-medium mb-6">
              <FileText className="w-4 h-4" />
              Legal Document
            </div>
            <h1 className="text-4xl md:text-5xl font-bold mb-4">Terms of Service</h1>
            <p className="text-muted-foreground text-lg">
              Last updated: March 8, 2026 · Effective: March 8, 2026
            </p>
          </div>

          <div className="prose prose-lg max-w-none space-y-10">
            {/* Agreement */}
            <section>
              <h2 className="text-2xl font-bold text-foreground flex items-center gap-2">
                <Scale className="w-6 h-6 text-primary" />
                1. Agreement to Terms
              </h2>
              <p className="text-muted-foreground leading-relaxed">
                By accessing or using Translatical ("the Platform"), you agree to be bound by these Terms of Service ("Terms"). If you do not agree to these Terms, you must not use the Platform. These Terms constitute a legally binding agreement between you and Translatical.
              </p>
              <p className="text-muted-foreground leading-relaxed">
                These Terms are governed by the laws of India, including the Information Technology Act, 2000, the Digital Personal Data Protection Act, 2023, and other applicable regulations.
              </p>
            </section>

            {/* Description */}
            <section>
              <h2 className="text-2xl font-bold text-foreground flex items-center gap-2">
                <Globe className="w-6 h-6 text-primary" />
                2. Description of Services
              </h2>
              <p className="text-muted-foreground leading-relaxed">
                Translatical provides the following services:
              </p>
              <ul className="text-muted-foreground space-y-2">
                <li><strong>Medical Record Storage:</strong> Secure storage and management of uploaded medical documents</li>
                <li><strong>AI-Powered Translation:</strong> Translation of medical records, prescriptions, and real-time communication between patients and healthcare providers</li>
                <li><strong>QR Code Identification:</strong> Patient identification system enabling hospital staff to access medical records</li>
                <li><strong>AI Therapeutic Support:</strong> AI-powered conversational support for mental wellness</li>
                <li><strong>Hospital Portal:</strong> A management interface for registered healthcare institutions</li>
              </ul>
            </section>

            {/* Medical Disclaimer */}
            <section className="bg-destructive/5 border border-destructive/20 rounded-xl p-6">
              <h2 className="text-2xl font-bold text-foreground flex items-center gap-2">
                <AlertTriangle className="w-6 h-6 text-destructive" />
                3. Medical Disclaimer
              </h2>
              <p className="text-muted-foreground leading-relaxed font-medium">
                IMPORTANT — PLEASE READ CAREFULLY:
              </p>
              <ul className="text-muted-foreground space-y-3">
                <li>Translatical is <strong>NOT a medical service provider</strong>. We are a technology platform that facilitates communication.</li>
                <li>AI-generated translations may contain errors. <strong>Always verify critical medical information</strong> with a qualified healthcare professional.</li>
                <li>The AI therapist feature provides <strong>general wellness support only</strong>. It is not a substitute for licensed mental health services. In case of a mental health emergency, contact local emergency services immediately.</li>
                <li>We do <strong>not provide medical advice, diagnosis, or treatment</strong> recommendations.</li>
                <li>Translatical is <strong>not liable for any medical decisions</strong> made based on translations or AI interactions provided through the Platform.</li>
              </ul>
            </section>

            {/* User Accounts */}
            <section>
              <h2 className="text-2xl font-bold text-foreground">4. User Accounts & Responsibilities</h2>
              
              <h3 className="text-xl font-semibold text-foreground mt-6">4.1 Account Registration</h3>
              <ul className="text-muted-foreground space-y-2">
                <li>You must provide accurate and complete information during registration</li>
                <li>You must verify your email address before accessing medical features</li>
                <li>You are responsible for maintaining the confidentiality of your login credentials</li>
                <li>You must immediately notify us of any unauthorized access to your account</li>
              </ul>

              <h3 className="text-xl font-semibold text-foreground mt-6">4.2 Medical Data Accuracy</h3>
              <ul className="text-muted-foreground space-y-2">
                <li>You are responsible for the accuracy of medical records you upload</li>
                <li>You must not upload fraudulent, falsified, or another person's medical records without authorization</li>
                <li>You understand that incorrect medical data may lead to inappropriate translations</li>
              </ul>

              <h3 className="text-xl font-semibold text-foreground mt-6">4.3 Consent & QR Code Sharing</h3>
              <ul className="text-muted-foreground space-y-2">
                <li>By generating a QR code, you consent to authorized hospital staff accessing your medical records</li>
                <li>You are responsible for controlling who scans your QR code</li>
                <li>All QR code-based access is logged and auditable</li>
              </ul>
            </section>

            {/* Hospital & Institutional Users */}
            <section>
              <h2 className="text-2xl font-bold text-foreground">5. Hospital & Institutional Users</h2>
              <ul className="text-muted-foreground space-y-2">
                <li>Hospitals must register with valid institutional credentials</li>
                <li>Hospital administrators are responsible for managing staff access</li>
                <li>Staff members may only access patient records for legitimate medical purposes</li>
                <li>Unauthorized access to patient data may result in immediate termination and legal action</li>
                <li>Hospitals must maintain their own regulatory compliance (e.g., NABH accreditation)</li>
              </ul>
            </section>

            {/* Subscriptions */}
            <section>
              <h2 className="text-2xl font-bold text-foreground flex items-center gap-2">
                <CreditCard className="w-6 h-6 text-primary" />
                6. Subscriptions & Payments
              </h2>
              <ul className="text-muted-foreground space-y-2">
                <li>Hospital subscriptions are billed as per the selected plan (Trial, Basic, Standard, Premium)</li>
                <li>Trial periods are limited and non-renewable</li>
                <li>Payments are non-refundable unless otherwise stated</li>
                <li>We reserve the right to modify pricing with 30 days' prior notice</li>
                <li>Failure to pay may result in downgrade or suspension of services</li>
              </ul>
            </section>

            {/* Prohibited Use */}
            <section>
              <h2 className="text-2xl font-bold text-foreground flex items-center gap-2">
                <ShieldAlert className="w-6 h-6 text-primary" />
                7. Prohibited Conduct
              </h2>
              <p className="text-muted-foreground leading-relaxed">You must not:</p>
              <ul className="text-muted-foreground space-y-2">
                <li>Use the Platform for any unlawful purpose</li>
                <li>Attempt to access other users' data without authorization</li>
                <li>Upload malicious files or code</li>
                <li>Scrape, reverse-engineer, or decompile the Platform</li>
                <li>Impersonate another person or entity</li>
                <li>Use automated systems (bots) to access the Platform</li>
                <li>Share your QR code publicly or with untrusted parties</li>
                <li>Use AI features to generate harmful, misleading, or illegal content</li>
              </ul>
            </section>

            {/* Intellectual Property */}
            <section>
              <h2 className="text-2xl font-bold text-foreground">8. Intellectual Property</h2>
              <ul className="text-muted-foreground space-y-2">
                <li>The Translatical name, logo, and branding are our intellectual property</li>
                <li>The Platform's software, design, and content are protected by copyright</li>
                <li>You retain ownership of your uploaded medical records</li>
                <li>You grant us a limited license to process your data solely for providing our services</li>
              </ul>
            </section>

            {/* Limitation of Liability */}
            <section>
              <h2 className="text-2xl font-bold text-foreground">9. Limitation of Liability</h2>
              <p className="text-muted-foreground leading-relaxed">
                To the maximum extent permitted by Indian law:
              </p>
              <ul className="text-muted-foreground space-y-2">
                <li>Translatical is provided <strong>"as is"</strong> without warranties of any kind</li>
                <li>We do not guarantee the accuracy of AI-powered translations</li>
                <li>We are not liable for any direct, indirect, incidental, or consequential damages arising from your use of the Platform</li>
                <li>Our total liability shall not exceed the amount paid by you to us in the 12 months preceding the claim</li>
                <li>We are not liable for any medical outcomes resulting from the use of our translations</li>
              </ul>
            </section>

            {/* Indemnification */}
            <section>
              <h2 className="text-2xl font-bold text-foreground">10. Indemnification</h2>
              <p className="text-muted-foreground leading-relaxed">
                You agree to indemnify and hold harmless Translatical, its officers, directors, employees, and agents from any claims, damages, losses, or expenses (including legal fees) arising from your use of the Platform, violation of these Terms, or infringement of any third-party rights.
              </p>
            </section>

            {/* Termination */}
            <section>
              <h2 className="text-2xl font-bold text-foreground">11. Termination</h2>
              <ul className="text-muted-foreground space-y-2">
                <li>You may terminate your account at any time by contacting us</li>
                <li>We may suspend or terminate your account for violation of these Terms</li>
                <li>Upon termination, your data will be handled as described in our <Link to="/privacy" className="text-primary hover:underline">Privacy Policy</Link></li>
                <li>Provisions regarding liability, indemnification, and dispute resolution survive termination</li>
              </ul>
            </section>

            {/* Dispute Resolution */}
            <section>
              <h2 className="text-2xl font-bold text-foreground">12. Dispute Resolution</h2>
              <ul className="text-muted-foreground space-y-2">
                <li>These Terms are governed by the laws of India</li>
                <li>Any disputes shall first be attempted to be resolved through mediation</li>
                <li>If mediation fails, disputes shall be subject to the exclusive jurisdiction of courts in New Delhi, India</li>
                <li>You may also file a complaint with the Data Protection Board of India for data-related grievances</li>
              </ul>
            </section>

            {/* Force Majeure */}
            <section>
              <h2 className="text-2xl font-bold text-foreground">13. Force Majeure</h2>
              <p className="text-muted-foreground leading-relaxed">
                We shall not be liable for any failure to perform due to causes beyond our reasonable control, including natural disasters, pandemics, government actions, internet outages, cyberattacks, or other force majeure events.
              </p>
            </section>

            {/* Contact */}
            <section>
              <h2 className="text-2xl font-bold text-foreground">14. Contact Us</h2>
              <div className="bg-muted/50 rounded-xl p-6 mt-4">
                <p className="text-foreground font-medium">Translatical Legal Team</p>
                <p className="text-muted-foreground">Email: <a href="mailto:legal@translatical.com" className="text-primary hover:underline">legal@translatical.com</a></p>
                <p className="text-muted-foreground">For privacy-related queries: <a href="mailto:dpo@translatical.com" className="text-primary hover:underline">dpo@translatical.com</a></p>
              </div>
            </section>
          </div>

          <div className="mt-12 pt-8 border-t border-border/50 text-center">
            <div className="flex items-center justify-center gap-4">
              <Link to="/privacy" className="text-sm text-primary hover:underline">Privacy Policy</Link>
              <span className="text-muted-foreground">·</span>
              <Link to="/" className="text-sm text-primary hover:underline">Back to Home</Link>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default TermsOfService;
