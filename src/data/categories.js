import kielbasyImg from "../assets/category_tiles/kielbasy.jpg";
import wedlinyImg from "../assets/category_tiles/wedliny.jpg";
import podroboweImg from "../assets/category_tiles/podrobowe.jpg";
import paczkiImg from "../assets/category_tiles/paczki.jpg";

import { GiSausage, GiMeat, GiLiver, GiCardboardBoxClosed } from "react-icons/gi";

export const customerCategories = [
  { id: "kielbasy", title: "Kiełbasy", image: kielbasyImg, to: "/kielbasy", icon: <GiSausage /> },
  { id: "wedliny", title: "Wędliny", image: wedlinyImg, to: "/wedliny", icon: <GiMeat /> },
  { id: "podrobowe", title: "Wyroby podrobowe", image: podroboweImg, to: "/wyroby-podrobowe", icon: <GiLiver /> },
  { id: "paczki", title: "Paczki", image: paczkiImg, to: "/nasze-paczki", icon: <GiCardboardBoxClosed /> },
];

export const adminCategories = [
{ id: "kielbasy", title: "Kiełbasy", image: kielbasyImg, to: "/admin/kielbasy", icon: <GiSausage /> },
  { id: "wedliny", title: "Wędliny", image: wedlinyImg, to: "/admin/wedliny", icon: <GiMeat /> },
  { id: "podrobowe", title: "Wyroby podrobowe", image: podroboweImg, to: "/admin/wyroby-podrobowe", icon: <GiLiver /> },
  { id: "paczki", title: "Paczki", image: paczkiImg, to: "/admin/nasze-paczki", icon: <GiCardboardBoxClosed /> },
]