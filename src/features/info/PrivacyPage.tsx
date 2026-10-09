import { Card } from '../../components/ui/Card';
import { usePageTitle } from '../../components/ui/usePageTitle';
import { BRAND } from '../../config/brand';
import { OwnerNote } from './OwnerNote';

export default function PrivacyPage() {
  usePageTitle('Privacy Policy');
  return (
    <>
      <div className="page-head">
        <h1>Privacy Policy</h1>
        <p>Draft for the {BRAND.name} prototype. It has not had legal review and does not claim compliance with any privacy law.</p>
      </div>
      <Card>
        <div className="stack">
          <OwnerNote>the name of the organisation or person responsible for this app, a contact method for privacy questions, and the date this policy takes effect. None are invented here.</OwnerNote>

          <section className="stack stack--sm">
            <h2>What this app stores</h2>
            <p>The app stores the following in your browser's local storage on this device: household name, number of people, water budget, daily water totals you enter or load as sample data, alert decisions, and challenge entries, goal and member names.</p>
          </section>
          <section className="stack stack--sm">
            <h2>What leaves your device</h2>
            <p>In this version the app has no backend, accounts, analytics or advertising, and it does not send the data above to any server or third party. Calculations run in your browser. Fonts are bundled with the app rather than loaded from an external font service.</p>
            <OwnerNote>whichever hosting provider serves the site may keep ordinary server logs, such as IP addresses and request times. Name the provider and describe its logging once a host is chosen. If analytics, accounts or a backend are added later, this policy must be rewritten first.</OwnerNote>
          </section>
          <section className="stack stack--sm">
            <h2>Cookies</h2>
            <p>The app does not set cookies. It uses local storage, described above, to remember your data.</p>
          </section>
          <section className="stack stack--sm">
            <h2>Your choices</h2>
            <p>You can delete logged use, or reset the whole app, from Settings. Clearing your browser's site data for this app also removes everything it stores. Because data is not sent to us, we cannot recover it for you.</p>
          </section>
          <section className="stack stack--sm">
            <h2>Children</h2>
            <p>The app is not directed at children and does not ask for personal details beyond the names you choose to type.</p>
            <OwnerNote>any age or consent requirements that apply where the app will be offered.</OwnerNote>
          </section>
          <section className="stack stack--sm">
            <h2>Changes</h2>
            <p>This draft will change as the app does. Review it before every public release.</p>
          </section>
        </div>
      </Card>
    </>
  );
}
