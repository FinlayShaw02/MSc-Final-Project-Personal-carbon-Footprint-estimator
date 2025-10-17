// Import activity arrays from each category
import businessTravelAirActivities from './business_travel_airActivities';
import businessTravelSeaActivities from './business_travel_seaActivities';
import deliveryVehiclesActivities from './delivery_vehiclesActivities';
import generalActivities from './generalActivities';
import homeworkingActivities from './homeworkingActivities';
import hotelStayActivities from './hotel_stayActivities';
import passengerVehiclesActivities from './passenger_vehiclesActivities';
import ukElectricityActivities from './uk_electricityActivities';
import ukElectricityForEvsActivities from './uk_electricity_for_evsActivities';
import wasteDisposalActivities from './waste_disposalActivities';
import waterSupplyActivities from './water_supplyActivities';
import foodActivities from './foodActivities';

// Combine all into one big array
const allActivities = [
  ...businessTravelAirActivities,
  ...businessTravelSeaActivities,
  ...deliveryVehiclesActivities,
  ...generalActivities,
  ...homeworkingActivities,
  ...hotelStayActivities,
  ...passengerVehiclesActivities,
  ...ukElectricityActivities,
  ...ukElectricityForEvsActivities,
  ...wasteDisposalActivities,
  ...waterSupplyActivities,
  ...foodActivities 
];

export default allActivities;
