# Astro Component Starter Launch Stream — Thursday March 12

## Run of Show

### 1. Cold open — the finished product (2 min)
*Mike drives screen*

Open on a branded site built with the starter (Jetstream or another example). No intros yet. Just: "This site was built from a single CLI command and a component library. Everything you see — the components, the page builder, the editing experience — ships out of the box."

Then intros. Keep it brief: who you both are, what you're doing here.

---

### 2. Astro 6 with Fred (7 min)
*Fred drives*

Fred talks about Astro 6 — what shipped, what it means for content-driven sites, where the framework is headed. This is Fred's segment. Let him own it.

**Steer questions toward the bridge:**
- "What are you seeing from the community around building marketing/content sites with Astro?"
- "What do you think is still harder than it should be for teams where developers and non-developers need to collaborate on a site?"

Don't force the transition. The questions should naturally lead to "ok, let me show you what we built."

---

### 3. Live scaffold (5 min)
*Mike drives, Fred reacts*

Run `npx create-astro-component-starter my-site-name` live. Show the site at localhost:4321. Quick tour: pages, blog, navigation, component docs.

**Key point to land:** This isn't a boilerplate with placeholder content. It's a working site with 30+ production components, a documentation site, and a visual editing setup — all from one command.

Fred's role: Ask questions, react. "What's in the components directory?" "How are these structured?" Play the curious developer.

---

### 4. Live branding demo (10–12 min)
*Mike drives, Fred comments*

Pick a brand (pre-selected — see prep notes below). Rebrand the starter live:
1. Start with design tokens — change colors, fonts, spacing. Show the site transform.
2. Go deeper into component CSS — customize specific components beyond what tokens cover.
3. Show the three-file pattern for a component: the .astro file, the CloudCannon inputs config, the structure/defaults.

**Fred's natural moments here:**
- Comment on the Astro component architecture ("this is just .astro files, there's no magic layer")
- Ask about decisions: "Why vanilla CSS instead of Tailwind?" "Why no JS framework for the components?"

**Land the point:** Tokens get you 80% fast. The remaining 20% is normal CSS in your own files — no fighting abstractions.

---

### 5. Visual editing reveal (8–10 min)
*Mike drives*

**This is the section that needs to land for the mixed audience.** Many viewers won't know what CloudCannon is. Frame it before showing it:

"Ok, the dev work is done. The site is branded, the components are built. What happens when you hand this to a marketing team?"

Then show:
- Click on a heading on the live site → edit it in place → it updates live
- Open the page builder → add a new section from the component library → reorder sections
- Show the permission controls — lock a section vs. open it up for full page building
- Show that content changes push back to the Git repo

**Fred's role:** He can ask the questions the audience has: "So the editor is seeing the actual site?" "What if they break something?" "Where does the content live?" Don't put him in a position to endorse CloudCannon over alternatives — let him ask genuine questions.

---

### 6. Jetstream (3 min)
*Mike drives*

Quick tour of Jetstream as the "finished product" example. Show how it extends the starter — richer tokens, new component variants, polished design. Link to Alysha's post for details. Keep it brief.

---

### 7. Q&A (10–15 min)
*Both*

Open the floor. Have these pre-seeded in case chat is slow:

**Astro-focused (for Fred):**
- "Can I use React/Vue/Svelte components alongside these Astro components?"
- "How does this compare to Astro's content layer approach?"
- "What Astro 6 features does the starter take advantage of?"

**CloudCannon-focused (for Mike):**
- "Can I use this without CloudCannon?"
- "How does the Git-based workflow handle merge conflicts from editor changes?"
- "What happens if I add my own components — does the editing config auto-generate?"

**Practical (either):**
- "Can I use this for a client project starting today?"
- "How do I pull in updates from the starter repo without losing my customizations?"
- "What's the performance like compared to a hand-built Astro site?"

---

### 8. Close (2 min)

**CTA:** "Clone it right now — `npx create-astro-component-starter` — and build something. We want to feature community sites built with the starter, so share what you make."

Drop links: repo, demo site, blog post, Jetstream, component docs.

Thank Fred. End the stream.

---

## Prep checklist

### Before Wednesday
- [ ] Pick 2–3 brand options for the live branding demo. Pre-test token changes for each so you know they look good. Have a backup in case your first pick doesn't demo well.
- [ ] Record a fallback of the branding demo in case of live technical issues. Don't mention it exists unless needed.
- [ ] Test audio setup with Fred. Echo or bad audio loses people in 30 seconds.
- [ ] Align with Fred on the structure — share this outline. Confirm he's comfortable with the Astro 6 opening and the "curious developer" role during demos.
- [ ] Confirm Fred is ok being asked the bridge questions in section 2. He may want to adjust the wording.

### Day of
- [ ] Pin in YouTube chat before going live: `npx create-astro-component-starter`, repo link, demo site link, blog post link
- [ ] Have someone (not you or Fred) moderating chat and surfacing good questions for Q&A
- [ ] Blog post goes live when? Coordinate timing — ideally live as the stream starts so you can link to it
- [ ] Fresh terminal, clean desktop, no notifications visible on screen share
- [ ] Have the branded demo site pre-built and ready to show in the cold open (section 1) before you scaffold from scratch (section 3)

### Post-stream
- [ ] Cut 3 clips from the VOD: cold open/scaffold (~2 min), branding transformation (~3 min), visual editing reveal (~2 min). These are your social content for the next 2 weeks.
- [ ] Post clips natively on X/Twitter, tag Fred and Astro. Let them repost.
- [ ] Announce the community showcase: "Build something with the starter, share it, we'll feature it." Give a specific hashtag or submission channel.

---

## Notes on Fred's role

Fred has other CMS sponsors (Webflow etc.). Don't put him in a position to compare or endorse. His presence is the endorsement. Let him:
- Talk about Astro 6 and the ecosystem (his territory)
- Ask genuine questions during demos (audience advocate)
- Comment on architecture and component design choices (technical credibility)

Don't ask him to:
- Compare CloudCannon to other CMS options
- Say anything that sounds like a CloudCannon testimonial
- Pitch CloudCannon features
