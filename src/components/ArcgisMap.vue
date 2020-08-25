<template>
  <div v-once class="map-cnt" ref="mapCnt"></div>
</template>
<script>
/**
 * @author 蔡惠民
 *
 */
import { loadModules } from "esri-loader";
import { getParticalRenderer } from "../arcgis/externalRenderers/particleRenderer";

export default {
  // name: "map",
  created() {},
  async mounted() {
    this.init();
  },
  computed: {},
  methods: {
    async loadexternalRenderers() {
      const [externalRenderers, Point] = await loadModules([
        "esri/views/3d/externalRenderers",
        "esri/geometry/Point"
      ]);

      const ParticalRenderer = await getParticalRenderer();

      const renderer = new ParticalRenderer({ view: this.view });
      externalRenderers.add(this.view, renderer);

      this.view.on("click", evt => {
        renderer.add(evt.mapPoint);
      });

      const point = new Point({
        latitude: 28.882008817162024,
        longitude: 112.12902842614919,
        z: 0,
        spatialReference: this.view.spatialReference
      });

      this.view.camera = {
        fov: 55,
        heading: 344.0870511501004,
        initialized: true,
        position: new Point({
          latitude: 27.832156888993442,
          longitude: 118.53910116498714,
          z: 243967.5655116681,
          spatialReference: this.view.spatialReference
        }),
        tilt: 63.94970016882801
      };
      setTimeout(() => {
        renderer.add(point);
      }, 0);
    },
    async init() {
      const [SceneView, Map] = await loadModules([
        "esri/views/SceneView",
        "esri/Map"
      ]);
      const map = new Map({
        basemap: "satellite"
      });
      const view = new SceneView(
        Object.assign(
          {
            map: map,
            container: this.$refs.mapCnt
          },
          {}
        )
      );
      window.view = view;
      this.view = view;
      view.when(async () => {
        console.log("view loaded");
        this.loadexternalRenderers();
      });
    }
  },
  destroyed() {}
};
</script>
<style scoped>
.map-cnt {
  height: 100%;
  width: 100%;
  margin: 0;
  padding: 0;
  overflow: hidden;
}
</style>
