import kielbasyImg from "../assets/category_tiles/kielbasy.webp";
import wedlinyImg from "../assets/category_tiles/wedliny.webp";
import podroboweImg from "../assets/category_tiles/podrobowe.webp";
import paczkiImg from "../assets/category_tiles/paczki.webp";

import {
  GiSausage,
  GiHamShank,
  GiLiver,
  GiCardboardBoxClosed,
} from "react-icons/gi";

export const customerCategories = [
  {
    id: "kielbasy",
    title: "Kiełbasy",
    image: kielbasyImg,
    to: "/sklep/kielbasy",
    icon: <GiSausage />,
  },
  {
    id: "wedliny",
    title: "Wędliny",
    image: wedlinyImg,
    to: "/sklep/wedliny",
    icon: <GiHamShank />,
  },
  {
    id: "podrobowe",
    title: "Wyroby podrobowe",
    image: podroboweImg,
    to: "/sklep/wyroby-podrobowe",
    icon: <GiLiver />,
  },
  {
    id: "paczki",
    title: "Paczki",
    image: paczkiImg,
    to: "/sklep/nasze-paczki",
    icon: <GiCardboardBoxClosed />,
  },
];

export const adminCategories = [
  {
    id: "kielbasy",
    title: "Kiełbasy",
    image: kielbasyImg,
    to: "/admin/kielbasy",
    icon: <GiSausage />,
  },
  {
    id: "wedliny",
    title: "Wędliny",
    image: wedlinyImg,
    to: "/admin/wedliny",
    icon: <GiHamShank />,
  },
  {
    id: "podrobowe",
    title: "Wyroby podrobowe",
    image: podroboweImg,
    to: "/admin/wyroby-podrobowe",
    icon: <GiLiver />,
  },
  {
    id: "paczki",
    title: "Paczki",
    image: paczkiImg,
    to: "/admin/nasze-paczki",
    icon: <GiCardboardBoxClosed />,
  },
];
