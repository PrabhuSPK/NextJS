import Image from "next/image";
import styles from "./page.module.css";
import About from "@/components/About/About";
import Contact from "@/components/Contact/Contact";
import { danfo, kablammo } from "./fonts";

export default function Home() {
  return (
    <div className={styles.page}>
      <h1>Global Multiple Font Usage</h1>
      <p className={kablammo.className}>Kablammo Font</p>
      <p className={danfo.className}>Danfo Font</p>
      <About />
      <Contact />
    </div>
  );
}
