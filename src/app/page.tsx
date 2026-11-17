import Image from "next/image";
import Scene from "@/components/Scene";
import Snow from "@/components/Snow";
import Countdown from "@/components/Countdown";
import LinkButtons from "@/components/LinkButtons";
import TokenStatus from "@/components/TokenStatus";
import Reveal from "@/components/Reveal";

const VALUES = [
  { title: "Be kind", text: "Behind every wallet is a real person." },
  { title: "Build together", text: "Support builders and good memes." },
  { title: "Enjoy Christmas", text: "Close the charts. Be with the people you love." },
];

export default function Home() {
  return (
    <>
      <Scene />
      <Snow />
      <div className="page">
        <Reveal>
          <header>
          <div className="brand">
            <Image src="/together-logo.webp" alt="Together logo" width={40} height={40} priority />
            <span>$TOGETHER</span>
          </div>
          <Countdown />
          </header>
        </Reveal>

        <main>
          <div className="col">
            <Reveal delay={0.1}><h1>Together</h1></Reveal>
            <Reveal delay={0.2}><p className="tag">Together, we make the trenches better.</p></Reveal>

            <Reveal delay={0.3}>
              <nav className="btns" aria-label="Links">
                <LinkButtons />
              </nav>
            </Reveal>
            <Reveal delay={0.35}>
              <TokenStatus />
            </Reveal>

            <Reveal delay={0.45}>
              <section className="story">
              <h2>Christmas is almost here.</h2>
              <p>
                Another year in the trenches is coming to an end. We&apos;ve seen the highs, the lows, the runners, and the rugs.
                But as Christmas approaches, let&apos;s remember what really matters.
              </p>
              <p>
                Be kind to each other. Support smaller builders. Build real communities and bring back the fun. Let&apos;s work
                together to create better volume, better opportunities, and a more positive environment for everyone.
              </p>
              <p>
                So when Christmas arrives, we can close our charts, spend time with our loved ones, and feel good about what
                we&apos;ve built.
              </p>
              <p className="end">Better trenches. Better Christmas. Together.</p>
              </section>
            </Reveal>

            <Reveal delay={0.55}>
              <div className="values">
              {VALUES.map((v) => (
                <div key={v.title}>
                  <h3>{v.title}</h3>
                  <p>{v.text}</p>
                </div>
              ))}
              </div>
            </Reveal>
          </div>
        </main>
      </div>
    </>
  );
}
