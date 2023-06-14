export interface IViewmodel {
  years: IYears[];
  totalPopulation: number;
}

export interface IYears {
  countries: ICountry[];
  year: string;
  totalPopulationPerYear: number;
}

export interface ICountry {
  countryName: string;
  year: string;
  population: number;
  populationDensity: number;
  populatoinGrowth: number;
}
