import { DAVClient } from "tsdav";

function getClient() {
  return new DAVClient({
    serverUrl: process.env.CALDAV_SERVER || "https://sync.infomaniak.com/",
    credentials: {
      username: process.env.CALDAV_USER || "",
      password: process.env.CALDAV_PASS || "",
    },
    authMethod: "Basic",
    defaultAccountType: "carddav",
  });
}

function createVCard(data: {
  uid: string;
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  note?: string;
}): string {
  let vcard = `BEGIN:VCARD
VERSION:3.0
UID:${data.uid}@hyponova.ch
N:${data.lastName};${data.firstName};;;
FN:${data.firstName} ${data.lastName}
EMAIL;TYPE=INTERNET:${data.email}`;

  if (data.phone) {
    vcard += `\nTEL;TYPE=CELL:${data.phone}`;
  }

  vcard += `\nORG:HYPONOVA Kunde`;

  if (data.note) {
    vcard += `\nNOTE:${data.note.replace(/\n/g, "\\n")}`;
  }

  vcard += `\nEND:VCARD`;
  return vcard;
}

export async function createContact(data: {
  uid: string;
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  note?: string;
}) {
  try {
    const client = getClient();
    await client.login();

    const addressBooks = await client.fetchAddressBooks();
    if (!addressBooks.length) {
      console.error("No address books found");
      return;
    }

    const addressBook = addressBooks[0];
    const vcardData = createVCard(data);

    await client.createVCard({
      addressBook,
      filename: `${data.uid}.vcf`,
      vCardString: vcardData,
    });
  } catch (err) {
    console.error("CardDAV create error:", err);
  }
}

export async function updateContact(data: {
  uid: string;
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  note?: string;
}) {
  try {
    const client = getClient();
    await client.login();

    const addressBooks = await client.fetchAddressBooks();
    if (!addressBooks.length) return;

    const addressBook = addressBooks[0];
    const vcards = await client.fetchVCards({ addressBook });
    const existing = vcards.find((v) => v.data?.includes(data.uid));

    if (existing) {
      const vcardData = createVCard(data);
      await client.updateVCard({
        vCard: { ...existing, data: vcardData },
      });
    } else {
      await createContact(data);
    }
  } catch (err) {
    console.error("CardDAV update error:", err);
  }
}
