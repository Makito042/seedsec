class CropSpec {
  final String id;
  final String name;
  final double density; // plants/hectare
  final double thousandSeedWeight; // grams
  final String spacing; // text spacing, e.g. "75 x 25 cm"

  const CropSpec({
    required this.id,
    required this.name,
    required this.density,
    required this.thousandSeedWeight,
    required this.spacing,
  });

  static const List<CropSpec> crops = [
    CropSpec(
      id: 'maize',
      name: 'Maize (Ibigori)',
      density: 53333,
      thousandSeedWeight: 300.0,
      spacing: '75 x 25 cm',
    ),
    CropSpec(
      id: 'tomato',
      name: 'Tomato (Inyanya)',
      density: 22222,
      thousandSeedWeight: 3.0,
      spacing: '75 x 60 cm',
    ),
    CropSpec(
      id: 'cabbage',
      name: 'Cabbage (Amashu)',
      density: 37037,
      thousandSeedWeight: 4.0,
      spacing: '60 x 45 cm',
    ),
    CropSpec(
      id: 'spinach',
      name: 'Spinach (Epina)',
      density: 111111,
      thousandSeedWeight: 10.0,
      spacing: '30 x 30 cm',
    ),
    CropSpec(
      id: 'carrot',
      name: 'Carrot (Sekeroti)',
      density: 500000,
      thousandSeedWeight: 1.5,
      spacing: '20 x 5 cm',
    ),
    CropSpec(
      id: 'chili',
      name: 'Chili (Urushenda)',
      density: 25000,
      thousandSeedWeight: 5.0,
      spacing: '60 x 45 cm',
    ),
    CropSpec(
      id: 'onion',
      name: 'Onion (Ibitunguru)',
      density: 400000,
      thousandSeedWeight: 4.0,
      spacing: '15 x 10 cm',
    ),
    CropSpec(
      id: 'cucumber',
      name: 'Cucumber (Amasamunyu)',
      density: 11111,
      thousandSeedWeight: 25.0,
      spacing: '120 x 60 cm',
    ),
    CropSpec(
      id: 'cauliflower',
      name: 'Cauliflower (Koli-fleri)',
      density: 27778,
      thousandSeedWeight: 3.5,
      spacing: '60 x 60 cm',
    ),
    CropSpec(
      id: 'radish',
      name: 'Radish (Redish)',
      density: 333333,
      thousandSeedWeight: 10.0,
      spacing: '15 x 5 cm',
    ),
    CropSpec(
      id: 'bitter_melon',
      name: 'Bitter Melon (Karera)',
      density: 8333,
      thousandSeedWeight: 60.0,
      spacing: '150 x 80 cm',
    ),
    CropSpec(
      id: 'bottle_gourd',
      name: 'Bottle Gourd (Igisabo)',
      density: 5556,
      thousandSeedWeight: 120.0,
      spacing: '200 x 90 cm',
    ),
    CropSpec(
      id: 'coriander',
      name: 'Coriander (Koriandire)',
      density: 400000,
      thousandSeedWeight: 10.0,
      spacing: '20 x 10 cm',
    ),
    CropSpec(
      id: 'hyacinth_bean',
      name: 'Hyacinth Bean (Gashyaza)',
      density: 22222,
      thousandSeedWeight: 250.0,
      spacing: '75 x 60 cm',
    ),
  ];
}
