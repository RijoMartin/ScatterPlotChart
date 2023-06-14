import { IYears, IViewmodel, ICountry } from "../InterfacesAndConstants/Interfaces";
import { uniq } from "lodash";
export function visualTransform(populationData: any[]): IViewmodel {
  const year: IYears[] = [];

  let population: IYears;

  let countryIndex = -1;
  let yearIndex = -1;
  let populationIndex = -1;
  let populationDensity = -1;
  let populationGrowth = -1;
  let columns;
  if (populationData.length > 0) {
    columns = Object.keys(populationData[0]);
    const uniqueYears = uniq(populationData.map((el) => el["Year"]));
    uniqueYears.forEach((yearData) => {
      const countriesData = populationData.filter((popData) => popData["Year"] === yearData);
      const country: ICountry[] = [];

      countriesData.forEach((countryEl) => {
        const popGrowthVal = `${countryEl[" Population_Growth_Rate "]}`;
        const isNegative = /\(|\)/.test(popGrowthVal);
        const popGrowth = isNegative
          ? -parseFloat(`${countryEl[" Population_Growth_Rate "]}`.replace(/\(|\)/g, ""))
          : parseFloat(`${countryEl[" Population_Growth_Rate "]}`.replace(/\(|\)/g, ""));

        country.push({
          countryName: countryEl["Country"],
          year: countryEl["Year"],
          population: parseFloat(`${countryEl[" Population (000s) "]}`.replace(/[,]/g, "")) * 1000,
          populationDensity: parseFloat(`${countryEl[" Population_Density "]}`.replace(/[,]/g, "")),
          populatoinGrowth: popGrowth,
        });
      });

      const totalPopulationPerYear = country
        .map((el) => el.population)
        .reduce((accumulator, currentValue) => {
          return accumulator + currentValue;
        }, 0);
      year.push({
        countries: country,
        totalPopulationPerYear: totalPopulationPerYear,
        year: yearData,
      });
    });
  }

  const totalPopulation = year
    .map((el) => el.totalPopulationPerYear)
    .reduce((accumulator, currentValue) => {
      return accumulator + currentValue;
    }, 0);

  return {
    totalPopulation: totalPopulation,
    years: year,
  };
}
