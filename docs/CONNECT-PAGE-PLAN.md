# The T-House Connect page plan

Give visitors a clear way to message The T-House and discover its videos. Use the studio’s script title and artwork to make Connect feel like a destination within the same site. Use the original logo colours through the existing tokens: signature red `#C83838`, sign white `#F5F5F5` and neutral charcoal. Keep Hurricane for the title and Barlow for readable labels and body text.

## Build

1. Compose the opening as an editorial collage. Put the red Connect title, a short invitation and the Instagram action beside layered T-House artwork. Render the existing house installation and threshold illustrations in monochrome to match the logo palette. Caption them as concept artwork. Stack the title, actions and art in reading order on phones. [Editorial Collage Hero](https://21st.dev/@felipemenezes098/components/hero-04) · [Image Stack](https://21st.dev/@tonyzebastian/components/image-stack)
2. Make the verified Instagram and YouTube destinations available as ordinary links from the first render. Use the existing graffiti stroke to reveal a red underline on hover or keyboard focus and pair it with a drawn arrow. Use a restrained spotlight in the card treatment. Give the verified episode a monochrome poster that links to its existing Watch page. [Contact Cards](https://21st.dev/@serafimcloud/components/contact-cards) · [Animated Link](https://21st.dev/@ruixen.ui/components/animated-link) · [Draw Random Underline](https://21st.dev/@osmosupply/components/draw-random-underline) · [Card Spotlight](https://21st.dev/@manuarora700/components/card-spotlight) · [Bento Grid](https://21st.dev/community/components/aceternity/bento-grid/default)
3. Add an optional message draft. Offer general enquiry, guest suggestion, collaboration and studio query as labelled choices. Give each choice a short prompt, use a single expanding message field, and let visitors review the exact message and copy it before opening Instagram. Keep the draft on the page and label the point where the visitor sends it on Instagram. Handle clipboard failure with selectable text. Provide a separate copy action for the official studio handle. [Choicebox](https://21st.dev/@halaska-studio/components/choicebox/titles-only) · [Auto-growing Text Area](https://21st.dev/@clevision/components/text-area/auto-growing-textarea) · [Live Preview Form](https://21st.dev/@dhxwhy/components/live-preview-form) · [Copy Button](https://21st.dev/@cubby-ui/components/copy-button)
4. Use a small FAQ accordion for questions the existing site can answer, including how to suggest a guest or collaboration and where to see the videos. Render it with native disclosure controls. Use subtle printed texture within the collage and one short reveal. Make pointer effects optional and show the final state immediately when the visitor reduces motion. [FAQ Accordion Section](https://21st.dev/@kedhareswer/components/slit-type-faq) · [Paper Texture](https://21st.dev/@paper-design/components/paper-texture) · [Vertical Cut Reveal](https://21st.dev/@cnippet-dev/components/vertical-cut-reveal)

## Component choices and dependencies

The options report compared several patterns for each job. The implementation combines the editorial collage, simple text actions, spotlight, message draft and compact FAQ into one page. A dock, magnetic movement and an animated border were alternative ways to style the same two social links. VHS, CRT, ink and stroke drawing were alternative opening treatments. The expanding gallery and image accordion were layout alternatives for the same small set of artwork. Contact 01 groups the Choicebox enquiry cards with the introduction. Write and Preview use segmented tabs when the draft panel is narrow and appear side by side when it is wide enough.

| Feature | What makes it ready |
| --- | --- |
| Direct form delivery and file transfer | Confirm the recipient, how the studio handles contact data, and which files the studio accepts. |
| Playable waveform | An approved audio clip with permission to publish it, plus a deliberate play action. The episode frame uses a static waveform as a decorative mark. |
| Map and station directions | Expand Map and Nearby Walk are available as labeled demos. Connect needs a confirmed public visitor address and approved directions. |
| Booking slots | The Slot Week Picker demo uses sample availability. Connect needs an approved booking offering and a source of live availability. |

The optional Preview images control accepts JPG and PNG for local review. Visitors select the original files separately in Instagram.

## Verify

- Check the layout at phone, tablet and desktop widths. Confirm that the two official links, the episode link and the FAQ are usable with keyboard, touch, reduced motion and JavaScript disabled.
- Check all four enquiry choices, the live preview, the empty draft, successful copy, a blocked clipboard and the Instagram handoff. Confirm the draft stays out of URLs and network requests.
- Check image selection, drag and drop, file type feedback and removal. Confirm images stay in the browser.
- Check FAQ search and its empty state, arrow-key navigation, copying a question link and opening it directly.
- Run lint, TypeScript and a production build. Record the browser checks in Implementation Status and the visual choice in the design context.
