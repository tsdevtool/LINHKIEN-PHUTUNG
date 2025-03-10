export const getTreeConfig = (treeData) => ({
  core: {
    animation: 0,
    check_callback: true,
    themes: {
      name: "default",
      dots: true,
      icons: true,
      stripes: true,
    },
    data: treeData,
  },
  types: {
    parent_category: {
      icon: "fa fa-folder",
    },
    child_category: {
      icon: "fa fa-folder-open",
    },
    product: {
      icon: "fa fa-cube",
    },
  },
  plugins: ["contextmenu", "dnd", "search", "state", "types", "wholerow"],
});

export const transformData = (categories, products) => {
  let treeData = [];

  categories.forEach((category) => {
    if (!category.parent_id) {
      // Add parent category
      treeData.push({
        id: category.id,
        text: category.name,
        parent: "#",
        type: "parent_category",
        original: category,
      });

      // Add child categories
      if (category.categories?.length > 0) {
        category.categories.forEach((child) => {
          treeData.push({
            id: child.id,
            text: child.name,
            parent: category.id,
            type: "child_category",
            original: child,
          });

          // Add products for child category
          const childProducts = products.filter(
            (p) => p.category_id === child.id
          );
          childProducts.forEach((product) => {
            treeData.push({
              id: `prod_${product.id}`,
              text: product.name,
              parent: child.id,
              type: "product",
              original: product,
            });
          });
        });
      }
    }
  });

  return treeData;
};
