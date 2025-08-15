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
      "Nasze wędliny pakujemy z wyjątkową starannością, aby dotarły do Ciebie świeże, aromatyczne i w idealnym stanie – prosto pod Twoje drzwi.",
  },
  {
    id: "always-fresh",
    icon: <SiCodefresh />,
    title: "Zawsze świeże",
    subtitle:
      "Starannie dbamy, by nasze wyroby były zawsze naturalne, aromatyczne i wolne od niepotrzebnych dodatków.",
  },
  {
    id: "secure-payments",
    icon: <RiSecurePaymentFill />,
    title: "Bezpieczne płatności",
    subtitle:
      "Gwarantujemy bezpieczne transakcje – skorzystaj z Przelewy24 lub tradycyjnego przelewu.",
  },
];

export const contactFeatures = [
  {
    id: "telephone",
    icon: <BsTelephoneFill />,
    title: "Masz jakieś pytania?",
    subtitle: "Zadzwoń: +48 500 877 347",
  },
  {
    id: "email",
    icon: <IoIosMail />,
    title: "Napisz wiadomość",
    subtitle: "kontakt@wedlinkalowkowice.pl",
  },
  {
    id: "address",
    icon: <IoLocationSharp />,
    title: "Odwiedź nas",
    subtitle: "ul. Księdza Rigola 42, 46-211 Łowkowice",
  },
];
