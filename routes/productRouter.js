const Router = require("express");
const router = new Router();
const productController = require("../controllers/productController");
const checkRole = require("../middleware/checkMiddleware");



router.post("/", checkRole("ADMIN"), productController.create);
router.get("/", productController.getAll);
router.get("/:id", productController.getOne);
router.delete("/:id", checkRole("ADMIN"), productController.delete);
router.put("/:id", checkRole("ADMIN"), productController.update);


module.exports = router;