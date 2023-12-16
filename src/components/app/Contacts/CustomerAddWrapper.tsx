import ContactAdd from "@/components/app/Contacts/ContactAdd.tsx";

export default function CustomerAddWrapper() {
  return (
    <div>
      <ContactAdd  contact_type={"customer"}/>
    </div>
  );
}