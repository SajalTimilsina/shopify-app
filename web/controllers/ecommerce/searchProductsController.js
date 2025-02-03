import Product from "../../models/product.js";

export const searchProducts = async (req, res) => {
  const { querySearch, shop } = req.query;
  const storeId = `offline_${shop}`;

  if (querySearch) {
    const searchCondition = {
      $or: [
        { title: { $regex: querySearch, $options: "i" } },
        //{ vendor: { $regex: querySearch, $options: "i" } },
        { "variants.sku": { $regex: querySearch, $options: "i" } },
      ],
    };

    const productSearchPipeline = [
      { $match: { storeId, ...searchCondition } },
      { $unwind: "$variants" }, // Unwind variants if you want individual variant results
      {
        $project: {
          title: 1,
          vendor: 1,
          "variants.sku": 1,
          "variants.price": 1,
          "variants.title": 1,
          "variants.id": 1,
          "variants.product_id": 1,
        },
      },
    ];

    try {
      const filterProducts = await Product.aggregate(productSearchPipeline);
      console.log(filterProducts);
      return res
        .status(200)
        .send({ message: "Products found", data: filterProducts });
    } catch (error) {
      console.log(error);
      return res
        .status(500)
        .send({ message: "Error searching products", error: error.message });
    }
  }

  res.status(200).send({ message: "No search query provided" });
};
