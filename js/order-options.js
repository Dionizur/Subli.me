// Fonte: Canva Valores - medidas - cores (A4), consultado em 21/10/2026.
const ORDER_OPTIONS = [
  {
    "id": "opcao-1",
    "tecido": "Algodão",
    "modelo": "Unissex",
    "preco": 69.3,
    "tamanhos": [
      "PP",
      "P",
      "M",
      "G",
      "GG",
      "XG",
      "XGG",
      "XGGG"
    ]
  },
  {
    "id": "opcao-2",
    "tecido": "Algodão",
    "modelo": "Baby look",
    "preco": 66.7,
    "tamanhos": [
      "P",
      "M",
      "G",
      "GG",
      "XG",
      "XGG",
      "XGGG"
    ]
  },
  {
    "id": "opcao-3",
    "tecido": "Algodão",
    "modelo": "Manga longa",
    "preco": 81.7,
    "tamanhos": [
      "PP",
      "P",
      "M",
      "G",
      "GG",
      "XG",
      "XGG",
      "XGGG"
    ]
  },
  {
    "id": "opcao-4",
    "tecido": "Algodão premium",
    "modelo": "Unissex",
    "preco": 73.7,
    "tamanhos": [
      "PP",
      "P",
      "M",
      "G",
      "GG",
      "XG",
      "XGG",
      "XGGG"
    ]
  },
  {
    "id": "opcao-5",
    "tecido": "Algodão premium",
    "modelo": "Feminina",
    "preco": 73.7,
    "tamanhos": [
      "P",
      "M",
      "G",
      "GG",
      "XG",
      "XGG",
      "XGGG"
    ]
  },
  {
    "id": "opcao-6",
    "tecido": "Algodão premium",
    "modelo": "Manga longa",
    "preco": 80.7,
    "tamanhos": [
      "PP",
      "P",
      "M",
      "G",
      "GG",
      "XG",
      "XGG",
      "XGGG"
    ]
  },
  {
    "id": "opcao-7",
    "tecido": "Algodão estonada",
    "modelo": "Unissex",
    "preco": 83.7,
    "tamanhos": [
      "PP",
      "P",
      "M",
      "G",
      "GG",
      "G1",
      "G2",
      "G3"
    ]
  },
  {
    "id": "opcao-8",
    "tecido": "Algodão estonada",
    "modelo": "Feminina",
    "preco": 83.7,
    "tamanhos": [
      "P",
      "M",
      "G",
      "GG",
      "G1"
    ]
  },
  {
    "id": "opcao-9",
    "tecido": "Algodão estonada",
    "modelo": "Manga longa",
    "preco": 90.7,
    "tamanhos": [
      "P",
      "M",
      "G",
      "GG",
      "G1"
    ]
  },
  {
    "id": "opcao-10",
    "tecido": "Oversized",
    "modelo": "Algodão suedine",
    "preco": 82.8,
    "tamanhos": [
      "P",
      "M",
      "G",
      "GG"
    ]
  },
  {
    "id": "opcao-11",
    "tecido": "Oversized",
    "modelo": "Estonada",
    "preco": 97.7,
    "tamanhos": [
      "PP",
      "P",
      "M",
      "G",
      "GG",
      "G1",
      "G2"
    ]
  },
  {
    "id": "opcao-12",
    "tecido": "Poliéster",
    "modelo": "Unissex branca",
    "preco": 60.3,
    "tamanhos": [
      "PP",
      "P",
      "M",
      "G",
      "GG",
      "XG",
      "XGG",
      "XGGG"
    ]
  },
  {
    "id": "opcao-13",
    "tecido": "Poliéster",
    "modelo": "Baby look branca",
    "preco": 60.3,
    "tamanhos": [
      "P",
      "M",
      "G",
      "GG",
      "XG",
      "XGG",
      "XGGG"
    ]
  },
  {
    "id": "opcao-14",
    "tecido": "Poliéster",
    "modelo": "Unissex colorida",
    "preco": 61.3,
    "tamanhos": [
      "PP",
      "P",
      "M",
      "G",
      "GG",
      "XG",
      "XGG",
      "XGGG"
    ]
  },
  {
    "id": "opcao-15",
    "tecido": "Poliéster",
    "modelo": "Baby look colorida",
    "preco": 61.3,
    "tamanhos": [
      "P",
      "M",
      "G",
      "GG",
      "XG",
      "XGG",
      "XGGG"
    ]
  },
  {
    "id": "opcao-16",
    "tecido": "Poliéster",
    "modelo": "Manga longa",
    "preco": 70.8,
    "tamanhos": [
      "PP",
      "P",
      "M",
      "G",
      "GG",
      "XG",
      "XGG",
      "XGGG"
    ]
  },
  {
    "id": "opcao-17",
    "tecido": "Poliviscose",
    "modelo": "Unissex",
    "preco": 66,
    "tamanhos": [
      "PP",
      "P",
      "M",
      "G",
      "GG",
      "XG",
      "XGG",
      "XGGG"
    ]
  },
  {
    "id": "opcao-18",
    "tecido": "Polo",
    "modelo": "Unissex",
    "preco": 79.5,
    "tamanhos": [
      "PP",
      "P",
      "M",
      "G",
      "GG",
      "XG",
      "XGG",
      "XGGG"
    ]
  },
  {
    "id": "opcao-19",
    "tecido": "Infantil",
    "modelo": "Algodão",
    "preco": 53.8,
    "tamanhos": [
      "1",
      "2",
      "4",
      "6",
      "8",
      "10",
      "12",
      "14"
    ]
  },
  {
    "id": "opcao-20",
    "tecido": "Infantil",
    "modelo": "Algodão premium",
    "preco": 56.5,
    "tamanhos": [
      "1",
      "2",
      "4",
      "6",
      "8",
      "10",
      "12",
      "14"
    ]
  },
  {
    "id": "opcao-21",
    "tecido": "Infantil",
    "modelo": "Algodão estonada",
    "preco": 59.5,
    "tamanhos": [
      "1",
      "2",
      "4",
      "6",
      "8",
      "10",
      "12",
      "14"
    ]
  },
  {
    "id": "opcao-22",
    "tecido": "Infantil",
    "modelo": "Poliéster",
    "preco": 49.5,
    "tamanhos": [
      "1",
      "2",
      "4",
      "6",
      "8",
      "10",
      "12",
      "14"
    ]
  },
  {
    "id": "opcao-23",
    "tecido": "Infantil",
    "modelo": "Poliviscose",
    "preco": 52.5,
    "tamanhos": [
      "1",
      "2",
      "4",
      "6",
      "8",
      "10",
      "12",
      "14"
    ]
  },
  {
    "id": "opcao-24",
    "tecido": "Infantil",
    "modelo": "Dryfit",
    "preco": 53.6,
    "tamanhos": [
      "1",
      "2",
      "4",
      "6",
      "8",
      "10",
      "12",
      "14"
    ]
  },
  {
    "id": "opcao-25",
    "tecido": "Moletom",
    "modelo": "Peluciado",
    "preco": 139.5,
    "tamanhos": [
      "P",
      "M",
      "G",
      "GG",
      "G1",
      "G2",
      "G3"
    ]
  },
  {
    "id": "opcao-26",
    "tecido": "Moletom",
    "modelo": "Careca - 2 cabos",
    "preco": 121.9,
    "tamanhos": [
      "P",
      "M",
      "G",
      "GG",
      "G1",
      "G2",
      "G3"
    ]
  },
  {
    "id": "opcao-27",
    "tecido": "Moletom",
    "modelo": "Careca - 3 cabos",
    "preco": 161.5,
    "tamanhos": [
      "P",
      "M",
      "G",
      "GG",
      "G1",
      "G2",
      "G3"
    ]
  },
  {
    "id": "opcao-28",
    "tecido": "Moletom",
    "modelo": "Canguru estonado",
    "preco": 160.5,
    "tamanhos": [
      "P",
      "M",
      "G",
      "GG",
      "G1",
      "G2",
      "G3"
    ]
  },
  {
    "id": "opcao-29",
    "tecido": "Moletom",
    "modelo": "Canguru - 2 cabos",
    "preco": 167.5,
    "tamanhos": [
      "P",
      "M",
      "G",
      "GG"
    ]
  },
  {
    "id": "opcao-30",
    "tecido": "Moletom",
    "modelo": "Canguru - 3 cabos",
    "preco": 194.5,
    "tamanhos": [
      "P",
      "M",
      "G",
      "GG"
    ]
  },
  {
    "id": "opcao-31",
    "tecido": "Dryfit",
    "modelo": "Unissex",
    "preco": 69.3,
    "tamanhos": [
      "PP",
      "P",
      "M",
      "G",
      "GG",
      "XG",
      "XGG",
      "XGGG"
    ]
  },
  {
    "id": "opcao-32",
    "tecido": "Dryfit",
    "modelo": "Manga longa",
    "preco": 77.5,
    "tamanhos": [
      "PP",
      "P",
      "M",
      "G",
      "GG",
      "XG",
      "XGG",
      "XGGG"
    ]
  }
];
