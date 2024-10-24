import Image from "next/image";
import styles from "./page.module.css";
import About from "@/components/About/About";
import Contact from "@/components/Contact/Contact";

export default function Home() {
  return (
    <div className={styles.page}>
      <h1>Components Usage</h1>
      <About />
      <Contact />
    </div>
  );
}
