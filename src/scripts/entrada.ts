// Compartido por las secciones que animan su propio título/contenido al
// entrar en pantalla (Banner, Favorita, Momento). Se factoriza acá porque las
// tres repiten exactamente el mismo mecanismo (esperar al pin del hero,
// partir un título en letras con orden diagonal); Home y Productos quedan
// como estaban, con su propia copia — no vale la pena tocarlas para esto.
import gsap from 'gsap';
import { SplitText } from 'gsap/SplitText';
import { CustomEase } from 'gsap/CustomEase';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(SplitText, CustomEase, ScrollTrigger);

// cubic-bezier(1, 0, 0.15, 1): casi plana al principio, sube empinada en el
// medio, llegada seca. Misma curva que el resto de la página.
export const GOLPE = CustomEase.create('golpe', 'M0,0 C1,0 0.15,1 1,1');

/**
 * Espera a que el pin del hero (Home.astro) exista de verdad antes de correr
 * `cb`. El hero arma su propio ScrollTrigger (que agranda el documento en
 * varios miles de px) recién cuando termina su entrada, hasta 4s después de
 * cargar. Si una sección más abajo mide su propio "start"/"end" antes de eso,
 * queda calculado contra un documento mucho más corto del real y el scrub
 * termina mapeado a un tramo de scroll que no es el real.
 *
 * Se chequea el alto real del pin-spacer y no una propiedad de GSAP
 * (`scrollTrigger.pin`): esa se pone en `true` en el mismo instante en que
 * se crea el ScrollTrigger, antes de que GSAP termine de medir cuánto scroll
 * reservarle — con esa señal el chequeo pasaba igual de temprano que sin él.
 */
export function esperarHero(cb: () => void) {
  const hero = document.querySelector<HTMLElement>('#home');
  const listo = () => {
    const spacer = document.querySelector<HTMLElement>('.pin-spacer');
    return !!(spacer && hero && spacer.offsetHeight > hero.offsetHeight * 1.5);
  };

  if (listo()) {
    cb();
    return;
  }

  let disparado = false;
  const espera = setInterval(() => {
    if (!listo()) return;
    disparado = true;
    clearInterval(espera);
    cb();
  }, 100);

  // Red de seguridad: si a los 5s el spacer todavía no creció (error en el
  // script del hero, o simplemente tardó de más), se arma igual contra lo
  // que haya en ese momento — mejor una medida imperfecta que ninguna.
  setTimeout(() => {
    clearInterval(espera);
    if (!disparado) cb();
  }, 5000);
}

/**
 * Parte cada elemento que matchee `selectorLinea` en caracteres y devuelve
 * todos juntos ordenados en diagonal (arriba-izquierda primero, abajo-derecha
 * al final) — mismo criterio que el titular del hero. Ya los deja en su
 * estado oculto (yPercent:115, x:-22), listos para animar a 0.
 */
export function letrasDiagonal(selectorLinea: string): HTMLElement[] {
  const cortes = gsap.utils
    .toArray<HTMLElement>(selectorLinea)
    // 'words,chars' y no solo 'chars': partiendo únicamente en letras, cada
    // una queda como su propio inline-block y el navegador puede cortar la
    // línea entre dos letras cualesquiera — en pantallas angostas el título
    // se parte en medio de una palabra. Al envolver también por palabras, el
    // corte solo puede caer en los espacios, y las letras se siguen animando
    // igual (`corte.chars` las devuelve todas).
    .map((linea) => new SplitText(linea, { type: 'words,chars' }));

  const letras = cortes
    .flatMap((corte) => corte.chars as HTMLElement[])
    .sort((a, b) => {
      const ra = a.getBoundingClientRect();
      const rb = b.getBoundingClientRect();
      return ra.left + ra.top - (rb.left + rb.top);
    });

  gsap.set(letras, { yPercent: 115, x: -22 });
  gsap.set(selectorLinea, { yPercent: 0 });

  return letras;
}

export { gsap, ScrollTrigger };
