-- Migration: Legal Pages (Impressum, AGB, Datenschutz)
-- Datum: 2026-04-30
-- Beschreibung: Editierbare Rechtstexte mit DE + EN Versionen.
--               Simon kann Inhalte ueber /admin/rechtliches selbst pflegen.

CREATE TABLE IF NOT EXISTS legal_pages (
  id text PRIMARY KEY CHECK (id IN ('impressum','agb','datenschutz')),
  title_de text NOT NULL DEFAULT '',
  title_en text NOT NULL DEFAULT '',
  title_highlight_de text NOT NULL DEFAULT '',
  title_highlight_en text NOT NULL DEFAULT '',
  content_html_de text NOT NULL DEFAULT '',
  content_html_en text NOT NULL DEFAULT '',
  meta_description_de text NOT NULL DEFAULT '',
  meta_description_en text NOT NULL DEFAULT '',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

CREATE OR REPLACE FUNCTION set_legal_pages_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS legal_pages_updated_at ON legal_pages;
CREATE TRIGGER legal_pages_updated_at
  BEFORE UPDATE ON legal_pages
  FOR EACH ROW
  EXECUTE FUNCTION set_legal_pages_updated_at();

-- ============================================================
-- Initial-Seed: aktuelle DE-Texte aus den hartkodierten Seiten
-- EN-Felder bleiben leer, Simon ergaenzt diese im Editor.
-- ============================================================

INSERT INTO legal_pages (id, title_de, title_highlight_de, content_html_de, meta_description_de)
VALUES (
  'impressum',
  '',
  'Impressum',
  '<h2>Firma</h2><p><strong>HYPONOVA GmbH</strong><br />Dahlienweg 22<br />4313 Möhlin<br />Schweiz</p><h2>Kontakt</h2><p>E-Mail: info@hyponova.ch<br />Telefon: +41 79 249 70 90</p><h2>Vertretungsberechtigte Person</h2><p>Simon Topalli, Geschäftsführer</p><h2>Handelsregistereintrag</h2><p>Eingetragen im Handelsregister des Kantons Aargau<br />UID: wird noch ergänzt</p><h2>Haftungsausschluss</h2><p>Die Inhalte dieser Website wurden mit grösster Sorgfalt erstellt. HYPONOVA übernimmt jedoch keine Gewähr für die Richtigkeit, Vollständigkeit und Aktualität der bereitgestellten Informationen. Die Nutzung der Inhalte erfolgt auf eigene Verantwortung.</p><p>Verweise und Links auf Websites Dritter liegen ausserhalb unseres Verantwortungsbereichs. Eine Haftung für solche Websites wird abgelehnt. Der Zugang und die Nutzung solcher Websites erfolgt auf eigenes Risiko.</p><h2>Urheberrecht</h2><p>Die Inhalte und Werke auf dieser Website unterliegen dem Schweizer Urheberrecht. Die Vervielfältigung, Bearbeitung, Verbreitung und jede Art der Verwertung ausserhalb der Grenzen des Urheberrechts bedürfen der schriftlichen Zustimmung von HYPONOVA.</p>',
  'Impressum der HYPONOVA GmbH, Möhlin, Schweiz.'
)
ON CONFLICT (id) DO NOTHING;

INSERT INTO legal_pages (id, title_de, title_highlight_de, content_html_de, meta_description_de)
VALUES (
  'agb',
  'Allgemeine',
  'Geschäftsbedingungen',
  '<h2>1. Geltungsbereich</h2><p>Diese Allgemeinen Geschäftsbedingungen (AGB) gelten für sämtliche Dienstleistungen der HYPONOVA GmbH, Dahlienweg 22, 4313 Möhlin, Schweiz (nachfolgend «HYPONOVA»). Mit der Nutzung unserer Website oder der Inanspruchnahme unserer Dienstleistungen erklären Sie sich mit diesen AGB einverstanden.</p><h2>2. Dienstleistungen</h2><p>HYPONOVA erbringt Vermittlungsdienstleistungen im Bereich der Hypothekarfinanzierung. Wir vergleichen die Angebote verschiedener Banken, Versicherungen und Pensionskassen und unterstützen Kundinnen und Kunden bei der Auswahl und dem Abschluss einer Hypothek.</p><p>HYPONOVA ist kein Finanzinstitut und vergibt keine Kredite. Sämtliche Kreditentscheide liegen bei den jeweiligen Finanzierungspartnern. HYPONOVA übernimmt keine Garantie für die Gewährung einer Finanzierung.</p><h2>3. Kostenfreiheit für Kundinnen und Kunden</h2><p>Die Beratung und der Vermittlungsprozess sind für Kundinnen und Kunden kostenlos. HYPONOVA wird im Falle eines erfolgreichen Abschlusses direkt vom jeweiligen Kreditgeber entschädigt. Sollte es zu keinem Abschluss kommen, entstehen Ihnen keinerlei Kosten.</p><h2>4. Pflichten der Kundinnen und Kunden</h2><p>Kundinnen und Kunden sind verpflichtet, wahrheitsgemässe und vollständige Angaben zu machen. HYPONOVA übernimmt keine Haftung für Nachteile, die aufgrund unzutreffender oder unvollständiger Angaben entstehen.</p><h2>5. Haftungsausschluss</h2><p>HYPONOVA bemüht sich um korrekte und aktuelle Informationen auf der Website und im Beratungsprozess. Eine Garantie für die Richtigkeit, Vollständigkeit und Aktualität der bereitgestellten Informationen wird jedoch nicht übernommen.</p><p>Die Haftung von HYPONOVA für leichte Fahrlässigkeit ist soweit gesetzlich zulässig ausgeschlossen. Dies gilt insbesondere für indirekte Schäden, Folgeschäden und entgangenen Gewinn.</p><h2>6. Datenschutz</h2><p>Der Schutz Ihrer persönlichen Daten ist uns wichtig. Einzelheiten zur Erhebung, Verarbeitung und Nutzung Ihrer Daten entnehmen Sie bitte unserer <a href="/datenschutz">Datenschutzerklärung</a>.</p><h2>7. Geistiges Eigentum</h2><p>Sämtliche Inhalte der Website (Texte, Grafiken, Logos, Bilder) sind urheberrechtlich geschützt und Eigentum von HYPONOVA oder der jeweiligen Rechteinhaber. Eine Vervielfältigung, Verbreitung oder sonstige Nutzung ohne schriftliche Genehmigung ist nicht gestattet.</p><h2>8. Änderungen der AGB</h2><p>HYPONOVA behält sich vor, diese AGB jederzeit zu ändern. Die jeweils aktuelle Fassung ist auf der Website einsehbar. Durch die weitere Nutzung unserer Dienstleistungen nach einer Änderung erklären Sie sich mit den angepassten AGB einverstanden.</p><h2>9. Anwendbares Recht und Gerichtsstand</h2><p>Es gilt ausschliesslich Schweizer Recht. Gerichtsstand ist Möhlin (AG), Schweiz, sofern nicht zwingende gesetzliche Bestimmungen einen anderen Gerichtsstand vorsehen.</p>',
  'Allgemeine Geschäftsbedingungen der HYPONOVA GmbH.'
)
ON CONFLICT (id) DO NOTHING;

INSERT INTO legal_pages (id, title_de, title_highlight_de, content_html_de, meta_description_de)
VALUES (
  'datenschutz',
  'Datenschutz',
  'erklärung',
  '<h2>1. Verantwortliche Stelle</h2><p>Verantwortlich für die Datenbearbeitung ist:</p><p><strong>HYPONOVA GmbH</strong><br />Dahlienweg 22<br />4313 Möhlin<br />Schweiz<br />E-Mail: info@hyponova.ch<br />Telefon: +41 79 249 70 90</p><h2>2. Grundsätze</h2><p>Wir bearbeiten Personendaten im Einklang mit dem Schweizer Bundesgesetz über den Datenschutz (nDSG) und, soweit anwendbar, der Europäischen Datenschutz-Grundverordnung (DSGVO). Wir erheben nur diejenigen Daten, die für die Erbringung unserer Dienstleistungen erforderlich sind.</p><h2>3. Erhobene Personendaten</h2><p>Wir können folgende Personendaten erheben:</p><ul><li>Kontaktdaten (Name, E-Mail, Telefonnummer, Adresse)</li><li>Finanzielle Angaben (Einkommen, Eigenmittel, bestehende Hypotheken)</li><li>Angaben zur Liegenschaft (Adresse, Kaufpreis, Verkehrswert)</li><li>Dokumente (Lohnausweise, Steuererklärungen, Pensionskassenausweise)</li><li>Technische Daten (IP-Adresse, Browser, Betriebssystem, Zugriffszeit)</li></ul><h2>4. Zweck der Datenbearbeitung</h2><p>Wir verwenden Ihre Daten für folgende Zwecke:</p><ul><li>Erbringung unserer Vermittlungsdienstleistungen</li><li>Einholung von Hypothekarangeboten bei unseren Partnerinstituten</li><li>Kommunikation mit Ihnen (E-Mail, Telefon, Videocall)</li><li>Verbesserung unserer Website und Dienstleistungen</li><li>Erfüllung gesetzlicher Pflichten</li></ul><h2>5. Weitergabe an Dritte</h2><p>Wir geben Ihre Personendaten nur an Dritte weiter, wenn dies zur Erbringung unserer Dienstleistungen erforderlich ist insbesondere an Partnerbanken, Versicherungen und Pensionskassen im Rahmen der Offerteinholung. Eine Weitergabe erfolgt nur mit Ihrer Einwilligung oder auf gesetzlicher Grundlage.</p><p>Wir verkaufen Ihre Daten nicht an Dritte und nutzen sie nicht für Werbezwecke Dritter.</p><h2>6. Cookies und Tracking</h2><p>Unsere Website kann Cookies verwenden, um die Benutzererfahrung zu verbessern. Cookies sind kleine Textdateien, die auf Ihrem Gerät gespeichert werden. Sie können die Verwendung von Cookies in Ihren Browser-Einstellungen einschränken oder deaktivieren.</p><p>Wir setzen derzeit keine Analyse- oder Tracking-Tools von Drittanbietern ein. Sollte sich dies ändern, werden wir Sie an dieser Stelle darüber informieren.</p><h2>7. Datensicherheit</h2><p>Wir treffen angemessene technische und organisatorische Massnahmen, um Ihre Personendaten vor unbefugtem Zugriff, Verlust oder Missbrauch zu schützen. Die Datenübertragung erfolgt verschlüsselt (SSL/TLS).</p><h2>8. Aufbewahrungsdauer</h2><p>Wir bewahren Ihre Personendaten nur so lange auf, wie es für die Erfüllung des jeweiligen Zwecks erforderlich ist oder gesetzliche Aufbewahrungspflichten bestehen. Danach werden die Daten gelöscht oder anonymisiert.</p><h2>9. Ihre Rechte</h2><p>Sie haben jederzeit das Recht auf:</p><ul><li>Auskunft über die bei uns gespeicherten Daten</li><li>Berichtigung unrichtiger Daten</li><li>Löschung Ihrer Daten (soweit keine gesetzliche Aufbewahrungspflicht besteht)</li><li>Einschränkung der Bearbeitung</li><li>Datenübertragbarkeit</li><li>Widerruf einer erteilten Einwilligung</li></ul><p>Um Ihre Rechte auszuüben, kontaktieren Sie uns bitte unter info@hyponova.ch.</p><h2>10. Änderungen</h2><p>Wir behalten uns vor, diese Datenschutzerklärung jederzeit anzupassen. Die aktuelle Fassung ist auf unserer Website einsehbar.</p>',
  'Datenschutzerklärung der HYPONOVA GmbH gemäss dem Schweizer Datenschutzgesetz (nDSG).'
)
ON CONFLICT (id) DO NOTHING;
