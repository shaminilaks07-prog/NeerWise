import { Card } from '../../components/ui/Card';
import { usePageTitle } from '../../components/ui/usePageTitle';
import { BRAND } from '../../config/brand';
import { OwnerNote } from './OwnerNote';

export default function TermsPage() {
  usePageTitle('Terms and Conditions');
  return (
    <>
      <div className="page-head">
        <h1>Terms and Conditions</h1>
        <p>Draft for the {BRAND.name} prototype. It has not had legal review.</p>
      </div>
      <Card>
        <div className="stack">
          <OwnerNote>the legal owner or operator, governing law and jurisdiction, a contact method, and an effective date. None are invented here.</OwnerNote>

          <section className="stack stack--sm">
            <h2>What the app is</h2>
            <p>{BRAND.name} is a prototype that helps a household record daily water use, compare it with a budget, and review unusual days. It is an information tool for personal use.</p>
          </section>
          <section className="stack stack--sm">
            <h2>Estimates and alerts are not guarantees</h2>
            <p>Estimates are averages of past days and may be wrong. Alerts mark suspicious patterns and do not confirm a leak, fault or waste. Savings figures are self-reported estimates based on stated assumptions. Do not rely on the app to detect leaks, prevent damage or meet a legal or billing requirement, and check your actual meter and plumbing.</p>
          </section>
          <section className="stack stack--sm">
            <h2>Sample data</h2>
            <p>Sample data is generated for demonstration. It does not describe your home or any real person.</p>
          </section>
          <section className="stack stack--sm">
            <h2>Your data</h2>
            <p>You are responsible for the numbers you enter. Data is stored only in your browser and may be lost if you clear site data or change device. See the Privacy Policy.</p>
          </section>
          <section className="stack stack--sm">
            <h2>Acceptable use</h2>
            <p>Do not use the app to break the law, or try to disrupt or reverse engineer a hosted copy of it in ways its licence does not allow.</p>
            <OwnerNote>the software licence for the source code.</OwnerNote>
          </section>
          <section className="stack stack--sm">
            <h2>No warranty and limits of liability</h2>
            <p>The app is provided as is, without warranties of any kind, during this prototype stage.</p>
            <OwnerNote>how liability should be limited. This needs review by a qualified professional before public launch.</OwnerNote>
          </section>
        </div>
      </Card>
    </>
  );
}
