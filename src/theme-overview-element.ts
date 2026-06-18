import { html, LitElement } from "lit";
import { customElement } from "lit/decorators.js";
import { isSameColor } from "./compare-color";
import {
  walkTokens,
  isRef,
} from "@nl-design-system-community/design-tokens-schema";
import fdnd from "./fdnd.tokens.json";
import { withRelatedProject } from '@vercel/related-projects';

const scraperUrl = withRelatedProject({
  projectName: 'theme-wizard-server',
  // Fallback API host
  defaultHost: process.env.API_HOST || '',
});

// custom element <theme-overview> uit Lit
@customElement("theme-overview")
export class ThemeOverview extends LitElement {
  json: object[] = [];
  constructor() {
    // constructor wordt voor elk element 1x aangeroepen
    // `super` is de `LitElement` `constructor` functie, die moet ook weer aangeroepen worden
    super();
    // TODO: Don't run this in the constructor, this is just WIP, but should make it in production
    this.analyse();
  }
  async analyse() {
    // scraper server must have been started using `pnpm run start:scraper`
    // TODO: make `url` configurable
    const data = await fetch(scraperUrl + "/scraper/api/v1/css-design-tokens?url=fdnd.nl");

    // Parse `json` from scraper result
    const tokens = await data.json();

    if (Array.isArray(tokens)) {
      // If all went well, we'll have an array with tokens info
      this.json = tokens;
    } else {
      // If something went wrong, reset the array so we'll never look at old tokens
      // when something broke.
      this.json = [];
    }

    // render the new analysis
    this.render();

    // ...and actually render it!
    // TODO: remove this, and just call `analyse` at a better time than in the constructor
    this.requestUpdate();
  }

  render() {
    // TODO: Get color values from `fdnd.tokens.json`
    let niceColors: unknown[] = [];
    let niceFonts: unknown[] = [];
    let niceSizes: unknown[] = [];
    // check welke kleur tokens er in de fdnd tokens staan,
    // met isRef kijk je of het referenties zijn naar andere kleuren, als dit niet waar is (! = not true) EN (&&) het type van de token is een kleur dan worden ze getoont
    walkTokens(fdnd, (token) => {
      if (!isRef(token.$value) && token.$type === "color") {
        niceColors = [...niceColors, token.$value];
      } else if (!isRef(token.$value) && token["$type"] === "fontFamilies") {
        niceFonts = [...niceFonts, token.$value];
      } else if (!isRef(token.$value) && token["$type"] === "dimension") {
        niceSizes = [...niceSizes, token.$value];
        console.log(token);
      }
    });

    const colors = this.json
      .filter((token) => token.$type === "color")
      .filter((token) =>
        niceColors.find((niceColor) =>
          isSameColor(
            String(niceColor),
            String(
              token["$extensions"][
                "nl.nldesignsystem.theme-wizard.css-authored-as"
              ],
            ),
          ),
        ),
      );
    const fontFamilies = this.json
      .filter((token) => token.$type === "fontFamily")
      .filter((token) => {
        // console.log(token);
        return niceFonts.find((niceFont) => niceFont === token.$value.at(0));
      });
    const fontSize = this.json
      .filter((token) => token.$type === "dimension")
      .filter((token) => {
        console.log(token);
        return niceSizes.find(
          (niceSize) =>
            niceSize === `${token.$value.value}${token.$value.unit}`,
        );
      });

    // TODO: first filter out all tokens that aren't even colors
    const evilTokens = this.json.filter(
      (token) =>
        !colors.includes(token) &&
        !fontFamilies.includes(token) &&
        !fontSize.includes(token),
    );

    // een evilTokens array die leeg is om de melding te testen als er geen tokens staan in de evilTokens
    // const evilTokens = []

    // console.log({ tokens: this.json, evilTokens, colors, niceFonts });

    return html` 
    <style> 
        article {
            background: #fff; 
            border-radius: 1rem;
            padding: 0.5rem;
            margin: 0.5rem;
            color: black;
            max-width: 500px;
            font-family: var(--fdnd-font);
        }
        h3 {
            font-size: 1.25rem;
            margin: 0.5rem;
        }
        ul {
            font-size: 1rem;
            margin: 0.5rem;
            padding: 0;
        }
        p {
            margin: 0.5rem;
        }
        details {
          margin: 0.5rem;
          padding: 0.5rem;
          font-family: var(--fdnd-font);
        }
        summary {
          font-size: 1.25rem;
          font-weight: 600;

        }
    </style>
    <article> 
        <h3>Colors</h2>
          ${
            colors.length === 0
              ? html`<p>
                  ❌ Fout: Er worden geen kleuren uit het NL Design System
                  gebruikt.
                </p>`
              : html`<p>
                  ✅ Goed: Er worden ${colors.length} kleur tokens uit het NL
                  Design System gebruikt!
                </p>`
          }
    </article>
    <article> 
        <h3>Font families</h2>
        ${
          fontFamilies.length === 0
            ? html`<p>
                ❌ Fout: Er worden geen font families uit het NL Design System
                gebruikt.
              </p>`
            : html`<p>
                ✅ Goed: Er worden ${fontFamilies.length} font family tokens uit
                het NL Design System gebruikt!
              </p>`
        }
    </article>

    <article> 
        <h3>Font sizes</h2>
        ${
          fontSize.length === 0
            ? html`<p>
                ❌ Fout: Er worden geen font sizes uit het NL Design System
                gebruikt.
              </p>`
            : html`<p>
                ✅ Goed: Er worden ${fontSize.length} font size tokens uit het
                NL Design System gebruikt!
              </p>`
        }
    </article>
    <details name="Overige tokens">
        ${
          evilTokens.length === 0
            ? html`<summary>Geen tokens zonder match gevonden</summary>
                <p>
                  Alle tokens uit de CSS komen overeen met een token uit het NL
                  Design System!
                </p>`
            : html` <summary>
                  Bekijk hier de ${evilTokens.length} tokens zonder match
                </summary>
                <ul>
                  ${evilTokens.map(
                    (token) =>
                      html`<li>
                        ${token.$type} token:
                        <code
                          >${token["$extensions"][
                            "nl.nldesignsystem.theme-wizard.css-authored-as"
                          ]}</code
                        >
                      </li>`,
                  )}
                </ul>`
        }
    </details>`;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    "theme-overview": ThemeOverview;
  }
}
