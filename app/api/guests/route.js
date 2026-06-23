// API Route para obtener invitados desde Google Sheets
import { getGuestsFromSheet } from "@/lib/googleSheets";

export async function GET(request) {
  try {
    const guests = await getGuestsFromSheet();

    return Response.json({
      success: true,
      data: guests,
      count: Object.keys(guests).length,
    });
  } catch (error) {
    console.error("Error en /api/guests:", error);

    return Response.json(
      {
        success: false,
        error: "No se pudo obtener los datos de invitados",
      },
      { status: 500 }
    );
  }
}

export const revalidate = 300; // ISR: revalidar cada 5 minutos
