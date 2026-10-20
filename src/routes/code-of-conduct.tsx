import { createFileRoute, Link } from "@tanstack/react-router";
import { LegalCallout, LegalPage } from "@/components/LegalPage";
import { SiteShell } from "@/components/SiteShell";
import { SITE } from "@/lib/site-knowledge";

export const Route = createFileRoute("/code-of-conduct")({ component: Page });

/**
 * How the atelier behaves — written down instead of assumed.
 *
 * A code of conduct at a house this size is not a compliance department; it is a
 * list of promises a customer can hold us to, and a set of rules the people at
 * the bench are given. Each section below answers a question someone actually
 * asks: who made this, were they treated properly, is the photo the truth, what
 * happens if I am unhappy, and how do I tell you something is wrong.
 */

const PRINCIPLES: { n: string; title: string; body: string }[] = [
  {
    n: "01",
    title: "Say what the thing actually is",
    body: "Gold polish is gold polish. A ruby-tone stone is a ruby-tone stone. Nothing is described as solid gold, hallmarked, certified or diamond unless it is, and a listing that is wrong is corrected the day we notice, not at the end of the season.",
  },
  {
    n: "02",
    title: "Tell the hard rule before the money moves",
    body: "All sales are final. The unboxing video is required. Refunds adjust against a later order. Nobody is allowed to bury any of that in a footer and take payment anyway — it is on the terms page, in the FAQ, and repeated in the booking itself.",
  },
  {
    n: "03",
    title: "Same shop for every customer",
    body: "No skipping the queue, no holding a piece without payment for someone who asks louder, no discount that only one person gets. If we make an exception we say what it was, and we would rather be consistent than clever.",
  },
  {
    n: "04",
    title: "Pay and treat the hands that make",
    body: "Everyone stringing, setting, photographing or packing is paid for the work, on time, and free to leave it. No piece of this shop depends on someone who cannot refuse it.",
  },
  {
    n: "05",
    title: "Own the mistake in one message",
    body: "When we get it wrong — a listing in error, a parcel packed badly, an answer that turned out to be wrong — we say so, fix it, and tell the people who bought it. Silence is not a policy here.",
  },
];

function Figure({ src, alt, caption }: { src: string; alt: string; caption: string }) {
  return (
    <figure className="not-prose my-8 overflow-hidden rounded-xl border border-line bg-paper">
      <img
        src={src}
        alt={alt}
        loading="lazy"
        decoding="async"
        className="h-[min(360px,42vh)] w-full object-cover"
      />
      <figcaption className="px-5 py-4 text-xs leading-relaxed text-muted">{caption}</figcaption>
    </figure>
  );
}

function Page() {
  return (
    <SiteShell>
      <LegalPage
        title="Code of conduct"
        kicker="How we work"
        updated="20 October 2026"
        wide
        image="/images/nav-atelier.jpg"
        imageAlt="The Raakha Grace workroom"
        toc={[
          { href: "#pledge", label: "The pledge" },
          { href: "#scope", label: "Who this binds" },
          { href: "#five", label: "The five principles" },
          { href: "#makers", label: "The people who make" },
          { href: "#materials", label: "Materials & honesty" },
          { href: "#customers", label: "How we treat customers" },
          { href: "#environment", label: "Waste & environment" },
          { href: "#online", label: "Online & community conduct" },
          { href: "#ethics", label: "Business ethics" },
          { href: "#report", label: "Report something" },
          { href: "#enforcement", label: "When we get it wrong" },
        ]}
      >
        <p>
          Raakha Grace is small enough that “company culture” is a description of specific people on
          specific days. That is an argument for writing this down rather than an excuse not to: a
          code you can point at is worth more to a customer than a values page nobody can quote back
          at us. This is ours, and it is written so you can hold it against a receipt.
        </p>

        <h2 id="pledge">The pledge</h2>
        <Figure
          src="/images/nav-craft.jpg"
          alt="Hands stringing beads at the atelier bench"
          caption="At the bench — every strand is counted, kotted and finished by a named pair of hands."
        />
        <p>
          We make light, handmade jewellery, and we make it honestly: what a piece is made of is
          what the page says, what you pay is what we quoted, and what we promise is something we have
          written down somewhere a person can read. Nothing here is a marketing line. If a customer
          ever finds our conduct and our copy disagreeing, the copy is the thing that has to change.
        </p>

        <LegalCallout
          label="In one breath"
          tone="accent"
          points={[
            "No invented gold, no invented certification, no invented scarcity.",
            "The rule that costs you money is the rule you hear before you pay.",
            "Everyone who works on a piece is paid, adult, and free to leave.",
            "Same terms for every order, whoever asks.",
            "Mistakes are owned in one message, not buried in a policy.",
          ]}
        />

        <h2 id="scope">Who this binds</h2>
        <p>
          Everyone who works on this shop: the founder, whoever is at the bench, whoever photographs
          or packs, and the small workshops and independent makers we place pieces with. It also
          binds how we behave toward the people who buy from us — on WhatsApp, on Instagram, and in
          this website's copy. Where we work with a maker, this code is described to them before any
          order goes to them, and a maker who will not meet the labour and honesty sections is not one
          we place work with.
        </p>
        <p>
          It does not, of course, bind our courier partners or Meta. Where their conduct affects your
          parcel, the atelier's obligation is to answer for it promptly and make it right with you,
          and that is what we do.
        </p>

        <h2 id="five">The five principles</h2>
        <div className="not-prose mt-6 grid gap-4 sm:grid-cols-2">
          {PRINCIPLES.map((p) => (
            <div key={p.n} className="rounded-xl border border-line bg-surface p-5">
              <p className="font-display text-2xl text-accent">{p.n}</p>
              <p className="mt-2 font-medium text-fg">{p.title}</p>
              <p className="mt-2 text-sm leading-relaxed text-muted">{p.body}</p>
            </div>
          ))}
          <div className="rounded-xl border border-accent/40 bg-accent/5 p-5 sm:col-span-2">
            <p className="font-medium text-fg">The sixth, because it is the one people test</p>
            <p className="mt-2 text-sm leading-relaxed text-muted">
              If an answer costs us a sale, it is still the answer we give. “Will this fade?” “Can you
              deliver it by Friday?” “Is this real gold?” — the correct reply, when it is no, is no.
            </p>
          </div>
        </div>

        <h2 id="makers">The people who make</h2>
        <p>
          Handmade means hands. These are the conditions those hands work under, and they are the same
          conditions we ask of the workshops we place orders with:
        </p>
        <ul>
          <li>
            <strong>Adults only, knowingly.</strong> No piece is strung, set or finished by a child,
            and we do not place work with a shop that uses family labour to hide it. Age is not
            something we take on trust in a new partner.
          </li>
          <li>
            <strong>Work given freely.</strong> No bonded, forced or inherited labour; nobody owes an
            advance, a fee, or a document they cannot get back. Original certificates and ID stay with
            the person who earned them.
          </li>
          <li>
            <strong>Paid on time, for every hour.</strong> Piece rates are agreed before the work
            starts and are paid on the agreed day. Overtime at a bench this size is a choice somebody
            makes for their own reasons, not a requirement to hit a deadline we set too late.
          </li>
          <li>
            <strong>Rest and leave.</strong> A working week with a day in it, leave you can actually
            take, and no penalty for being ill. Festival closures are real closures, not a shift to
            working from home.
          </li>
          <li>
            <strong>No harsh treatment, of any kind.</strong> No shouting as a management method, no
            fines for a dropped bead, no deduction from pay as discipline, no physical, verbal or
            psychological pressure. A stone that falls out is a five-minute repair, not an accusation.
          </li>
          <li>
            <strong>A bench that is safe to sit at.</strong> Daylight where possible, tools in good
            order, a first-aid box that is stocked, no work assigned to someone who is not steady
            enough for it, and a route to say “this machine or this arrangement is not safe” that
            reaches the founder the same day.
          </li>
          <li>
            <strong>Free to leave, and to speak.</strong> Nobody is told whom they may talk to, and
            nobody loses work for asking a question about their pay.
          </li>
        </ul>

        <h2 id="materials">Materials, photography and honesty about both</h2>
        <Figure
          src="/images/nav-bridal.jpg"
          alt="A bridal set laid out on cloth"
          caption="On the page — photographs are of the piece we will send you, not a similar one."
        />
        <p>
          Everything here is handmade fashion jewellery: gold polish and gold-plated metal with
          pearls, kundan, crystal and ruby-tone stones. It is not solid gold, it is not hallmarked, and
          it is not sold as though it were either. Where a listing uses a word that could be read as a
          claim — “real coral”, “diamond”, “gold” — the product page has to say what is actually in
          the piece, in the same place the word appears.
        </p>
        <ul>
          <li>
            <strong>Photographs are of the piece you get</strong>, or of an identical piece from the
            same batch — never a stock image standing in for something we do not have.
          </li>
          <li>
            <strong>Colour is disclosed, not flattered.</strong> Slight variation from screen to
            screen is stated on the terms page rather than hidden, and a piece that photographs
            unusually warm is described as such.
          </li>
          <li>
            <strong>Availability is the live count.</strong> If a strand is sold out we say it is sold
            out and quote the made-to-order time, rather than letting you pay against something that
            no longer exists.
          </li>
          <li>
            <strong>Nothing is passed off as someone else's design.</strong> A piece inspired by a
            regional style is described as inspired. We do not reproduce another house's protected
            work, and we do not use another shop's photographs.
          </li>
        </ul>

        <h2 id="customers">How we treat the people who buy</h2>
        <p>
          This is the section a customer can actually use, so it is deliberately specific:
        </p>
        <ol>
          <li>
            <strong>The inconvenient terms come first.</strong> No exchange or refund on dislike, the
            continuous unboxing video, one-way shipping on an approved return, refunds adjusted
            against a later order. Every one of these is stated before payment is requested.
          </li>
          <li>
            <strong>We talk you out of a bad fit.</strong> If a bangle size is likely to sit wrong, if
            a piece will not survive daily wear against sweat and perfume, or if the date you need it
            for is not achievable, we say so and let you not buy it.
          </li>
          <li>
            <strong>No invented urgency.</strong> No “only one left” that is not true, no countdown
            timer, no price we pretend to raise. Scarcity here is real and small-batch, and we will
            tell you which one it is.
          </li>
          <li>
            <strong>Enquiries are answered or closed, not strung along.</strong> We confirm stock
            before we take money, and we tell you plainly if a message is going to sit unanswered.
          </li>
          <li>
            <strong>Your data is not a shop asset.</strong> What we hold about you is listed on the{" "}
            <a href="/data-protection">data protection page</a>, we do not sell it, and one message
            gets it corrected or deleted.
          </li>
        </ol>

        <h2 id="environment">Waste, materials and the environment</h2>
        <p>
          We are honest about this rather than impressive about it. A bench this size does not have an
          environmental audit, and we are not going to claim certifications we do not hold. What we
          do hold:
        </p>
        <ul>
          <li>
            Stones, pearls, chains and findings are bought from Indian dealers in small quantities,
            and we ask what is being sold — plated base metal is described to us as plated base metal.
          </li>
          <li>
            Offcuts, dead stock and beads from a piece that came apart are kept and reused rather than
            binned; the seconds tray becomes the next batch of studs.
          </li>
          <li>
            Packaging is a box, a ribbon and a tissue pouch, chosen so it can be reused or recursed
            rather than thrown out; no plastic blister, no polystyrene fill, no shrink-wrap.
          </li>
          <li>
            Gold polish and plating chemicals arrive finished on the metal from our suppliers — we do
            not electroplate at the bench, so there is no plating effluent to dispose of here.
          </li>
          <li>
            Repairs are offered before replacement, and the free first polish within six months exists
            partly so a piece is kept rather than discarded.
          </li>
        </ul>

        <h2 id="online">Online and community conduct</h2>
        <Figure
          src="/images/nav-community.jpg"
          alt="Customers wearing Raakha Grace jewellery"
          caption="In the open — what we show publicly is what we are prepared to be asked about."
        />
        <p>
          The thread, the comments and the DMs run on the same rules as the bench. We will answer a
          hard question in public, and we do not delete criticism of our own work — a complaint about
          a parcel is useful to the next customer. What we do not do is publish anything about you: a
          photograph, a screenshot of a conversation, a name, an address or an order reference, unless
          you sent it to us to share and said we could.
        </p>
        <p>
          Harassment of anyone at the atelier — abusive language, threats, a message sent forty times,
          sexualised remarks to whoever is answering the WhatsApp — ends the conversation. We will say
          that it has ended, refund any payment already taken on an undelivered order, and we will not
          be drawn into arguing about it in a public comment. That applies in both directions, and a
          customer who feels spoken to at should tell us.
        </p>

        <h2 id="ethics">Business ethics</h2>
        <ul>
          <li>
            <strong>No bribes, no kickbacks, no “facility fees”</strong> to anyone — courier,
            official, or a supplier who wants the order. A gift received is declared to the founder,
            and nothing bought from us depends on one.
          </li>
          <li>
            <strong>Reviews are real.</strong> We do not buy reviews, do not post them to our own
            page, and do not offer a discount in exchange for a five-star note. A gifted piece for a
            review is disclosed as gifted, on the post, every time.
          </li>
          <li>
            <strong>Partnerships are declared.</strong> Paid, gifted or bartered collaborations appear
            on the <a href="/affiliations">affiliations page</a> and on the post itself. There is no
            undisclosed affiliate programme running on this site today.
          </li>
          <li>
            <strong>Competition is fair.</strong> We do not disparage another shop to win an order, do
            not poach a maker mid-contract with a promise we cannot keep, and do not misrepresent our
            own standing, size, or affiliations. We are not associated with any larger brand, and say
            so plainly.
          </li>
          <li>
            <strong>Other people's work stays theirs.</strong> We do not reuse another atelier's
            photographs, patterns or copy, and we do not ask a customer to send us a competitor's
            design for a copy — an inspired-by request is welcome, a photocopy is not.
          </li>
          <li>
            <strong>Money is clean.</strong> Prices, shipping and taxes are stated as they are charged.
            We do not accept payment for something we cannot deliver, and we do not launder an order
            history for anyone who asks us to.
          </li>
          <li>
            <strong>Confidentiality both ways.</strong> What a customer tells us about an order, and
            what a maker tells us about their costs, stay with us.
          </li>
        </ul>

        <h2 id="report">If you want to report something</h2>
        <p>
          Anything on this page can be challenged by anyone — a customer, a maker, a supplier, or
          somebody who saw a post. Send it to {SITE.whatsapp} on WhatsApp, or{" "}
          <a href={SITE.instagram}>@raakhagrace</a> in a DM, and start the message with the word{" "}
          <strong>conduct</strong> so it is not read as an order enquiry. You will get an
          acknowledgement within one working day and a substantive answer within fifteen.
        </p>
        <p>
          Reports can be made without giving your name. Nobody at the bench loses work, a rate, or a
          placement for raising a concern in good faith, and a complaint about how a customer was
          treated is investigated the same way as a complaint about a worker. If a matter is a crime
          or a safety emergency, contact the police or the appropriate authority as well as us — we
          will cooperate with whatever they need and tell you what we have done.
        </p>

        <h2 id="enforcement">When we get it wrong</h2>
        <p>
          A breach by someone working with us is dealt with in proportion: corrected, then documented,
          then — if the work is placed with a maker or supplier who will not meet this code — the
          orders stop. A customer affected by a breach is told, in the same message as the fix. There
          is no internal-only outcome when the person harmed was outside the atelier.
        </p>
        <p>
          This code is read against the <a href="/terms">terms of service</a>, which govern individual
          orders, and the <a href="/privacy">privacy policy</a> and{" "}
          <a href="/data-protection">data protection page</a>, which govern your information. Where
          they differ, the terms of service decide an order and this page decides behaviour. It is
          reviewed at least once a year, and the date at the top of this page is the date it was last
          read and changed.
        </p>

        <div className="not-prose mt-10 grid gap-3 sm:grid-cols-3">
          {[
            { to: "/terms", label: "Terms of service" },
            { to: "/faq", label: "Questions, answered" },
            { to: "/reach-information", label: "Reach the atelier" },
          ].map((l) => (
            <Link
              key={l.to}
              to={l.to}
              className="rounded-lg border border-line bg-surface px-4 py-3 text-sm transition-colors hover:border-accent hover:text-accent"
            >
              {l.label} →
            </Link>
          ))}
        </div>
      </LegalPage>
    </SiteShell>
  );
}
