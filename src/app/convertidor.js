export default function getAmountInWords(number) {
    const UNIDADES = [
      "",
      "un",
      "dos",
      "tres",
      "cuatro",
      "cinco",
      "seis",
      "siete",
      "ocho",
      "nueve",
    ];
    const DECENAS = [
      "diez",
      "once",
      "doce",
      "trece",
      "catorce",
      "quince",
      "dieciséis",
      "diecisiete",
      "dieciocho",
      "diecinueve",
      "veinte",
    ];
    const DECENAS_DIEZ = [
      "",
      "diez",
      "veinte",
      "treinta",
      "cuarenta",
      "cincuenta",
      "sesenta",
      "setenta",
      "ochenta",
      "noventa",
    ];
    const CENTENAS = [
      "",
      "cien",
      "doscientos",
      "trescientos",
      "cuatrocientos",
      "quinientos",
      "seiscientos",
      "setecientos",
      "ochocientos",
      "novecientos",
    ];
  
    function convertirNumero(n) {
      if (n < 10) return UNIDADES[n];
      if (n < 20) return DECENAS[n - 10];
      if (n < 100)
        return (
          DECENAS_DIEZ[Math.floor(n / 10)] +
          (n % 10 !== 0 ? " y " + UNIDADES[n % 10] : "")
        );
      if (n < 1000)
        return (
          (n === 100 ? "cien" : CENTENAS[Math.floor(n / 100)]) +
          (n % 100 !== 0 ? " " + convertirNumero(n % 100) : "")
        );
      if (n < 1000000)
        return (
          (Math.floor(n / 1000) === 1 ? "mil" : convertirNumero(Math.floor(n / 1000)) + " mil") +
          (n % 1000 !== 0 ? " " + convertirNumero(n % 1000) : "")
        );
      return "Número fuera de rango";
    }
  
    return convertirNumero(number) + " pesos";
  }
  