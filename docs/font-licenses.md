# Local font licensing

- **Cardo** is included under the SIL Open Font License. The license text is stored at `app/fonts/licenses/Cardo-OFL.txt`.
- **PP Mori** was supplied from the user's local `Free for Personal Use` package. Its bundled EULA is stored at `app/fonts/licenses/PP-Mori-EULA-Free-For-Personal-Use.pdf`.
- **Archivo** is installed through `@fontsource-variable/archivo` under the SIL
  Open Font License. Projections loads the latin variable WOFF2 locally and
  does not make a Google Fonts request.

Before any public or client production deployment, replace the current PP Mori files with copies covered by the appropriate commercial/webfont license. The CSS family and weight mapping can remain unchanged if the licensed filenames are kept consistent.
