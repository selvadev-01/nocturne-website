import { Nav } from "@/components/Nav";
import { Clock } from "@/components/Clock";
import { Journey } from "@/components/Journey";
import { Departures } from "@/components/Departures";
import { Cabins } from "@/components/Cabins";
import { Worth } from "@/components/Worth";
import { Book } from "@/components/Book";
import { Footer } from "@/components/Footer";

export default function Home() {
  return (
    <>
      <Nav />
      <Clock />
      <main id="main">
        <Journey />
        <Departures />
        <Cabins />
        <Worth />
        <Book />
      </main>
      <Footer />
    </>
  );
}
