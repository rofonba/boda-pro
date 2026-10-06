// /boda.ics — archivo de calendario de la boda.
//
// Se sirve con su tipo MIME real (text/calendar) para que el iPhone lo abra
// directamente en Calendario y Outlook/escritorio lo importen al descargarlo.

import { generarIcs } from "@/lib/calendario";

export const dynamic = "force-static";

export function GET() {
  return new Response(generarIcs(), {
    headers: {
      "Content-Type": "text/calendar; charset=utf-8",
      "Content-Disposition": 'inline; filename="boda-roberto-cristina.ics"',
    },
  });
}
