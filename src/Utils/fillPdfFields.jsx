import { PDFName, PDFRadioGroup } from "pdf-lib";

// Field names and option values differ between PDF versions. The original
// form uses descriptive names (e.g. "citizen"); the 2025 EAC form uses
// generated names (e.g. "TXT-0051"). Detect which one was loaded.
const PDF_LAYOUTS = {
  legacy: {
    fields: {
      citizen: "citizen",
      eighteen_years: "eighteen_years",
      salutation: "salutation",
      first_name: "first_name",
      middle_names: "middle_names",
      last_name: "last_name",
      suffix: "suffix",
      salutation_2: "salutation_2",
      first_name_2: "first_name_2",
      middle_names_2: "middle_names_2",
      last_name_2: "last_name_2",
      suffix_2: "suffix_2",
      dob_month: "dob_month",
      dob_day: "dob_day",
      dob_year: "dob_year",
      telephone_number: "telephone_number",
      race_ethnic_group: "race_ethnic_group",
      home_address: "home_address",
      apt_lot_number: "apt_lot_number",
      city: "city",
      state: "state",
      zip_code: "zip_code",
      mail_address: "mail_address",
      mail_city: "mail_city",
      mail_state: "mail_state",
      mail_zip_code: "mail_zip_code",
      prev_address: "prev_address",
      prev_apt_lot_number: "prev_apt_lot_number",
      prev_city: "prev_city",
      prev_state: "prev_state",
      prev_zip_code: "prev_zip_code",
      id_number: "id_number",
      choice_of_party: "choice_of_party",
    },
    options: {},
    splitDob: true,
  },
  eac2025: {
    fields: {
      citizen: "TXT-0051",
      eighteen_years: "TXT-0053",
      salutation: "TXT-0055",
      last_name: "TXT-0059",
      first_name: "TXT-0060",
      middle_names: "TXT-0061",
      suffix: "TXT-0062",
      salutation_2: "TXT-0083",
      last_name_2: "TXT-0087",
      first_name_2: "TXT-0088",
      middle_names_2: "TXT-0089",
      suffix_2: "TXT-0090",
      dob: "TXT-0076",
      telephone_number: "TXT-0077",
      id_number: "TXT-0078",
      choice_of_party: "TXT-0079",
      race_ethnic_group: "TXT-0080",
      home_address: "TXT-0067",
      apt_lot_number: "TXT-0068",
      city: "TXT-0069",
      state: "TXT-0070",
      zip_code: "TXT-0071",
      mail_address: "TXT-0072",
      mail_city: "TXT-0073",
      mail_state: "TXT-0074",
      mail_zip_code: "TXT-0075",
      prev_address: "TXT-0095",
      prev_apt_lot_number: "TXT-0096",
      prev_city: "TXT-0097",
      prev_state: "TXT-0098",
      prev_zip_code: "TXT-0099",
    },
    // App value -> PDF export value.
    options: {
      citizen: { yes: "Yes" },
      eighteen_years: { yes: "Yes" },
      salutation: { Mr: "Mr", Mrs: "Mrs.", Miss: "Miss", Ms: "Ms." },
      salutation_2: { Mr: "Mr.", Mrs: "Mrs.", Miss: "Miss", Ms: "Ms." },
      suffix: { "Jr.": "Jr", "Sr.": "Sr", II: "II", III: "III", IV: "IV" },
      suffix_2: { "Jr.": "Jr", "Sr.": "Sr", II: "II", III: "III", IV: "IV" },
    },
    splitDob: false,
  },
};

const detectLayout = (form) =>
  form.getFields().some((field) => field.getName() === "citizen")
    ? PDF_LAYOUTS.legacy
    : PDF_LAYOUTS.eac2025;

// The legacy PDF uses radio groups; the 2025 PDF uses multi-widget checkboxes,
// which pdf-lib's check() cannot target, so set /V and each widget's /AS directly.
const selectOption = (form, layout, key, appValue) => {
  if (!appValue) return;
  const name = layout.fields[key];
  const pdfValue = layout.options[key]
    ? layout.options[key][appValue]
    : appValue;
  if (!pdfValue) return;
  const field = form.getField(name);
  if (field instanceof PDFRadioGroup) {
    field.select(pdfValue);
    return;
  }
  const value = PDFName.of(pdfValue);
  field.acroField.dict.set(PDFName.of("V"), value);
  field.acroField.getWidgets().forEach((widget) => {
    widget.setAppearanceState(
      widget.getOnValue() === value ? value : PDFName.of("Off"),
    );
  });
};

const fillPdfFields = (form, formData) => {
  const layout = detectLayout(form);
  const text = (key) => form.getTextField(layout.fields[key]);

  // (1) Personal Information
  //Citizen and age
  selectOption(form, layout, "citizen", "yes");
  selectOption(form, layout, "eighteen_years", "yes");

  //Current Name
  selectOption(form, layout, "salutation", formData.current_title);
  text("first_name").setText(formData.current_first_name);
  text("middle_names").setText(formData.current_middle_names);
  text("last_name").setText(formData.current_last_name);
  selectOption(form, layout, "suffix", formData.current_suffix);

  //Previous Name
  selectOption(form, layout, "salutation_2", formData.prev_title);
  text("first_name_2").setText(formData.prev_first_name);
  text("middle_names_2").setText(formData.prev_middle_names);
  text("last_name_2").setText(formData.prev_last_name);
  selectOption(form, layout, "suffix_2", formData.prev_suffix);

  //Date of Birth, Phone, Race
  if (layout.splitDob) {
    text("dob_month").setText(formData.date_of_birth_month);
    // adjusting font size
    text("dob_month").setFontSize(12);
    text("dob_day").setText(formData.date_of_birth_day);
    // adjusting font size
    text("dob_day").setFontSize(12);
    text("dob_year").setText(formData.date_of_birth_year);
    // adjusting font size
    text("dob_year").setFontSize(5);
  } else if (formData.date_of_birth_month) {
    text("dob").setText(
      `${formData.date_of_birth_month}/${formData.date_of_birth_day}/${formData.date_of_birth_year}`,
    );
    // adjusting font size
    text("dob").setFontSize(10);
  }
  text("telephone_number").setText(formData.phone_number);
  text("race_ethnic_group").setText(formData.race_ethnic_group);

  //(2) Addresses
  //Home
  const currentAddress =
    formData.current_street_address +
    formData.current_apt_number +
    formData.current_city +
    formData.current_zip_code;
  //check if anything other than default state selection is filled out
  if (currentAddress) {
    text("home_address").setText(formData.current_street_address);
    text("apt_lot_number").setText(formData.current_apt_number);
    text("city").setText(formData.current_city);
    text("state").setText(formData.current_state);
    text("zip_code").setText(formData.current_zip_code);
  }

  //Mail
  text("mail_address").setText(
    `${formData.mail_street_address} ${formData.mail_apt_number}`,
  );
  text("mail_city").setText(formData.mail_city);
  text("mail_state").setText(formData.mail_state);
  text("mail_zip_code").setText(formData.mail_zip_code);

  //Previous
  //Maine override
  if (formData.current_state == "Maine" && formData.prev_street_address == "") {
    text("prev_address").setText("N/A");
  } else {
    text("prev_address").setText(formData.prev_street_address);
  }
  text("prev_apt_lot_number").setText(formData.prev_apt_number);
  text("prev_city").setText(formData.prev_city);
  text("prev_state").setText(formData.prev_state);
  text("prev_zip_code").setText(formData.prev_zip_code);

  //(3) Identification
  //No id or ssn
  if (formData.id_number === "" && formData.ssn_number === "") {
    text("id_number").setText("none");
    //Both id and ssn
  } else if (formData.id_number != "" && formData.ssn_number != "") {
    text("id_number").setText(formData.id_number + ", " + formData.ssn_number);
    //Id or ssn
  } else {
    text("id_number").setText(formData.id_number + formData.ssn_number);
  }

  //(4) Political Party
  text("choice_of_party").setText(formData.party_choice);
};

export default fillPdfFields;
