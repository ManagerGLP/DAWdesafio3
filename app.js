angular.module('fakeStoreApp', [])
  .controller('MainCtrl', ['$http', '$scope', function ($http, $scope) {
    var vm = this;

    // variables principales del controlador
    vm.products = [];
    vm.categories = [];
    vm.selectedCategory = null; // empiezo con ninguna categoría seleccionada
    vm.searchQuery = '';
    vm.cart = [];
    vm.selectedProduct = null;
    vm.cartSummary = { items: [], total: 0 };
    vm.loading = false;

    // tratar de leer el carrito guardado antes en localStorage
    vm.loadCartState = function () {
      try {
        var saved = window.localStorage.getItem('fakeStoreCart');
        vm.cart = saved ? JSON.parse(saved) : [];
        if (!Array.isArray(vm.cart)) {
          vm.cart = [];
        }
      } catch (e) {
        // por si localStorage está bloqueado o los datos están rotos
        vm.cart = [];
      }
      vm.saveCartState();
      vm.updateCartSummary();
    };

    // guardar el carrito en localStorage siempre que cambie
    vm.saveCartState = function () {
      try {
        window.localStorage.setItem('fakeStoreCart', JSON.stringify(vm.cart));
      } catch (e) {
        // si no se puede almacenar, simplemente no hacemos nada
      }
    };

    // traer productos desde la API Fake Store
    vm.loadProducts = function () {
      return $http.get('https://fakestoreapi.com/products')
        .then(function (response) {
          vm.products = response.data || [];
        })
        .catch(function () {
          vm.products = [];
        });
    };

    // traer categorías desde la API Fake Store
    vm.loadCategories = function () {
      return $http.get('https://fakestoreapi.com/products/categories')
        .then(function (response) {
          vm.categories = response.data || [];
        })
        .catch(function () {
          vm.categories = [];
        });
    };

    // inicializar la app: cargar el carrito y luego productos y categorías
    vm.init = function () {
      vm.loadCartState();
      vm.loading = true;
      return Promise.all([vm.loadProducts(), vm.loadCategories()])
        .finally(function () {
          vm.loading = false;
          $scope.$applyAsync();
        });
    };

    // filtro por categoría en la vista
    vm.byCategory = function (product) {
      if (!vm.selectedCategory) {
        return true;
      }
      return product.category === vm.selectedCategory;
    };

    // filtro por nombre usando el input de búsqueda
    vm.byName = function (product) {
      if (!vm.searchQuery) {
        return true;
      }
      var query = vm.searchQuery.toLowerCase();
      return product.title.toLowerCase().indexOf(query) !== -1;
    };

    // limpiar filtros de categoría y búsqueda
    vm.clearFilters = function () {
      vm.selectedCategory = null;
      vm.searchQuery = '';
    };

    // actualizar el resumen del carrito antes de mostrar el modal
    vm.updateCartSummary = function () {
      vm.cartSummary.items = vm.cart;
      vm.cartSummary.total = vm.cartTotal();
    };

    // calcular total del carrito
    vm.cartTotal = function () {
      return vm.cart.reduce(function (sum, item) {
        return sum + item.price * item.qty;
      }, 0);
    };

    // mostrar los detalles del producto en el modal
    vm.verDetalles = function (producto) {
      vm.selectedProduct = producto;
      $scope.selectedProduct = producto; // también lo ponemos en $scope por si Angular lo necesita
      setTimeout(function () {
        $('#productModal').modal('show');
      }, 50);
    };

    // alias para mantener compatibilidad con la vista
    vm.showProductDetails = vm.verDetalles;

    // agregar producto al carrito o incrementar cantidad si ya existe
    vm.addToCart = function (product) {
      var found = vm.cart.find(function (item) {
        return item.id === product.id;
      });
      if (found) {
        found.qty += 1;
      } else {
        vm.cart.push({
          id: product.id,
          title: product.title,
          price: product.price,
          qty: 1
        });
      }
      vm.saveCartState();
      vm.updateCartSummary();
      $('#productModal').modal('hide');
      $scope.$applyAsync();
    };

    // abrir modal del carrito con los datos actualizados
    vm.openCart = function () {
      vm.updateCartSummary();
      setTimeout(function () {
        $('#cartModal').modal('show');
      }, 50);
    };

    // vaciar carrito y eliminar de localStorage
    vm.clearCart = function () {
      vm.cart = [];
      vm.saveCartState();
      vm.updateCartSummary();
      $scope.$applyAsync();
    };

    // simular pago y limpiar todo
    vm.checkout = function () {
      alert('Pago simulado con éxito. Total: ' + vm.cartTotal());
      vm.clearCart();
      $('#cartModal').modal('hide');
    };

    vm.init();
  }]);
