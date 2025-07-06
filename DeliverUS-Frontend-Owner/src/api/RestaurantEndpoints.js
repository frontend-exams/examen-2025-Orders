import { get, post, put, destroy } from './helpers/ApiRequestsHelper'
function getAll () {
  return get('users/myrestaurants')
}

function getDetail (id) {
  return get(`restaurants/${id}`)
}

function getRestaurantCategories () {
  return get('restaurantCategories')
}

function create (data) {
  return post('restaurants', data)
}

function update (id, data) {
  return put(`restaurants/${id}`, data)
}

function remove (id) {
  return destroy(`restaurants/${id}`)
}

function getRestaurantOrders (restaurantId) {
  return get(`/restaurants/${restaurantId}/orders`)
}
// Estaba sin completar
function getRestaurantAnalytics (restaurantId) {
  // Para completar un endpoint nos fijamos en la ruta del controlador (backend)
  return get(`/restaurants/${restaurantId}/analytics`)
}

export { getRestaurantOrders, getRestaurantAnalytics, getAll, getDetail, getRestaurantCategories, create, update, remove }
