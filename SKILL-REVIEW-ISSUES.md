# unocss-variants review issues

Recovered from the Claude skills review on 2026-10-10. File paths and cited line numbers were checked against the current local files. Runtime findings explicitly attributed to the earlier audit were not rerun. Items that still need runtime confirmation say so.

Package HEAD: `903e8df`. Docs HEAD: `3f65b93`. The docs checkout has uncommitted changes, so these references describe the working tree.

P1 means broken examples or important functionality. P2 means incorrect behavior or guidance. P3 means documentation cleanup or an investigation with limited evidence. These are follow-up tasks; no source fixes are included.

## Package source

- [ ] **P1: Installed 1.5.0 runtime and declarations disagree.** The earlier audit of the docs-installed 1.5.0 build found no runtime cn export despite its type declaration, plus a legacy createUv export. This differs from the current repository source. The installed version and recorded compatibility table still exist locally. Evidence: `../docs/node_modules/unocss-variants/package.json:4`, `../docs/skills/unocss-variants/SKILL.md:124`. Suggested fix: Build and publish from the intended source revision, then verify runtime exports against declarations and test a direct cn import.

- [ ] **P1: Installed build drops inherited compoundSlots.** The prior runtime probe found that an extended child loses the parent compoundSlots on the installed 1.5.0 distribution. Current source concatenates them. Evidence: `src/internal/resolve-options.ts:145`, `../docs/skills/unocss-variants/SKILL.md:129`. Suggested fix: Include the inheritance fix in the published build and verify a child with no compoundSlots of its own.

- [ ] **P2: Empty-slot and false-condition behavior differs by build.** Earlier probes found that slots: {} returns a string on installed 1.5.0 and that an omitted flag does not match compoundSlots flag: false. The source produces slot functions and matches that condition. Evidence: `../docs/skills/unocss-variants/SKILL.md:128`, `../docs/skills/unocss-variants/SKILL.md:130`, `src/internal/class-resolver.ts:57`. Suggested fix: Define the intended behavior and include these cases in distribution parity checks before publishing.

- [ ] **P2: Extended base class ordering changes when slots are added.** The ordinary base value joins parent then child, but the branch for a slotted child and a parent without slots joins child then parent. Whether that difference is intentional needs a contract decision. Evidence: `src/internal/resolve-options.ts:102`, `src/internal/resolve-options.ts:118`. Suggested fix: Choose one inheritance order or document the exception; verify recipe() and recipe.base output for a parent without slots.

- [ ] **P3: Type documentation links omit the concepts path.** The @see links for composition, slots, and variants point outside the actual concepts route. Evidence: `src/types.ts:204`, `src/types.ts:213`, `src/types.ts:218`, `src/types.ts:232`. Suggested fix: Insert /concepts/ in the URLs and check the anchors.

- [ ] **P3: Benchmark script points to a missing runner.** package.json runs benchmark/run.mjs, but the file is absent in the local checkout. The docs already note this limitation. Evidence: `package.json:31`, `../docs/content/unocss-variants/3.guides/3.benchmark.md:25`. Suggested fix: Add the intended runner or remove the unusable script until it is available.

## Docs pages

- [ ] **P2: Inheritance is described without a published-build boundary.** The getting-started and composition pages promise inherited compoundSlots without mentioning the installed 1.5.0 limitation. Evidence: `../docs/content/unocss-variants/1.getting-started/1.index.md:173`, `../docs/content/unocss-variants/2.concepts/5.composing-components.md:8`. Suggested fix: Document the supported release and workaround until a corrected distribution is published.

- [ ] **P2: Child variants and compounds are described as replacements.** The composition page says inherited variants and compoundVariants can be overridden. Source appends their classes/entries; defaultVariants is the field with child-key replacement behavior. Evidence: `../docs/content/unocss-variants/2.concepts/5.composing-components.md:151`, `src/utils.ts:149`, `src/internal/resolve-options.ts:107`. Suggested fix: Explain concatenation separately from defaultVariants replacement and show the resulting class strings.

- [ ] **P2: Optionality wording is contradictory.** The TypeScript page implies that missing defaults keep axes required, then says VariantProps marks every axis optional. Source UvProps uses optional keys. Evidence: `../docs/content/unocss-variants/2.concepts/8.typescript.md:50`, `../docs/content/unocss-variants/2.concepts/8.typescript.md:100`, `src/types.ts:122`. Suggested fix: State that VariantProps keys are optional and show Required<Pick<...>> or a wrapper for mandatory UI inputs.

- [ ] **P2: API table uses a bare generic return type.** The extend field is shown as UvReturnType | undefined, but the source type requires five generic arguments. The sample also says parent recipe or null, contradicting the field table. Evidence: `../docs/content/unocss-variants/4.api/1.index.md:38`, `../docs/content/unocss-variants/4.api/1.index.md:47`, `src/types.ts:170`. Suggested fix: Use an appropriate concrete inferred type or documented generic form, and make the absent-parent value consistent with runtime behavior.
