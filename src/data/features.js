import { TbTruckDelivery } from "react-icons/tb";
import { SiCodefresh } from "react-icons/si";
import { RiSecurePaymentFill } from "react-icons/ri";

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
      "Zapłać szybko i bez obaw przez PayU lub tradycyjny przelew."
  }
];
