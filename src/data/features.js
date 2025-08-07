import { TbTruckDelivery } from "react-icons/tb";
import { SiCodefresh } from "react-icons/si";
import { RiSecurePaymentFill } from "react-icons/ri";

import { BsTelephoneFill } from "react-icons/bs";
import { IoIosMail } from "react-icons/io";
import { IoLocationSharp } from "react-icons/io5";

export const homeFeatures = [
  {
    id: "safe-delivery",
    icon: <TbTruckDelivery />,
    title: "Bezpieczna dostawa",
    subtitle:
      "Wysyłamy nasze wędliny specjalnie zabezpieczone, prosto do Twoich drzwi."
  },
  {
    id: "always-fresh",
    icon: <SiCodefresh />,
    title: "Zawsze świeże",
    subtitle:
      "Dbamy o najwyższą jakość i świeżość – bez żadnych zbędnych dodatków."
  },
  {
    id: "secure-payments",
    icon: <RiSecurePaymentFill />,
    title: "Bezpieczne płatności",
    subtitle:
      "Zapłać szybko i bez obaw przez Przelewy24 lub tradycyjny przelew."
  }
];

export const contactFeatures = [
  {
    id: "telephone",
    icon: <BsTelephoneFill />,
    title: "Masz jakieś pytania?",
    subtitle:
      "Zadzwoń: +48 123 456 789"
  },
  {
    id: "email",
    icon: <IoIosMail />,
    title: "Napisz wiadomość",
    subtitle:
      "kontakt@wedlinkalowkowice.pl"
  },
  {
    id: "address",
    icon: <IoLocationSharp />,
    title: "Odwiedź nas",
    subtitle:
      "ul. Przykładowa 12e, 11-999 Łowkowice"
  }
]
