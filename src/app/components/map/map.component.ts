import { AfterViewInit, Component, inject, OnDestroy, OnInit } from '@angular/core';
import * as geojson from 'geojson';
import * as L from 'leaflet';
import { GeoJSON, LatLng, Layer, LeafletMouseEvent, Map, Point } from 'leaflet';
import { map, Subscription } from 'rxjs';

import { EMapType, IGeoJson, IMapState } from '../../interfaces/building.interface';
import { BuildingService } from '../../services/building.service';
import { NgOptimizedImage, NgStyle } from '@angular/common';
import { MapTypePipe } from '../../pipes/map-type.pipe';
import { IModal, ModalService } from '../../services/modal.service';
import { MAP_COLOR, MAP_CONTAINER_ID, MAP_MVD_CENTER, MAP_ZOOM } from '../../constants/map.constant';
import { BreakpointObserver, Breakpoints } from '@angular/cdk/layout';
import { toSignal } from '@angular/core/rxjs-interop';
import { DomSanitizer } from '@angular/platform-browser';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-map',
  templateUrl: './map.component.html',
  styleUrl: './map.component.scss',
  imports: [MapTypePipe, NgOptimizedImage, NgStyle, FormsModule],
})
export class MapComponent implements AfterViewInit, OnInit, OnDestroy {
  mapState: IMapState;

  protected readonly mapTypes = EMapType;
  protected readonly mapColors = MAP_COLOR;
  protected readonly mapContainerId = MAP_CONTAINER_ID;
  private map: Map;
  private readonly buildingService = inject(BuildingService);
  private readonly modalService = inject(ModalService);
  private readonly sanitizer = inject(DomSanitizer);
  private subscriptions: Subscription[] = [];
  private featureGroup: GeoJSON;
  private breakpointObserver$ = inject(BreakpointObserver);
  private isMobile$ = this.breakpointObserver$.observe(Breakpoints.Handset).pipe(map((result: any) => result.matches));
  isMobile = toSignal(this.isMobile$, { initialValue: true });

  ngOnInit(): void {
    this.subscriptions.push(
      this.buildingService.buildings$.subscribe((buildings: IGeoJson) => {
        if (this.map) this.loadMarks(buildings);
      }),
    );
    this.subscriptions.push(
      this.buildingService.stateMap$.subscribe((mapState: IMapState) => {
        if (mapState) this.mapState = mapState;
      }),
    );
  }

  ngOnDestroy(): void {
    this.subscriptions.forEach((subscription: Subscription) => subscription.unsubscribe());
  }

  ngAfterViewInit(): void {
    this.initMap();
  }

  onYearChange(event: Event): void {
    const inputElement = event.target as HTMLInputElement;
    const selectedYear = inputElement.value;
    const filter = { ...this.mapState, yearSelected: +selectedYear };
    this.buildingService.setMapState(filter);
    this.buildingService.getBuildings();
  }

  refreshMap(event: any): void {
    const isChecked = event.target.checked;
    const filter = { ...this.mapState };

    this.buildingService.setIncludeMovies(isChecked);
    this.buildingService.setMapState(filter);
    this.buildingService.getBuildings();
  }

  openMoreInfoModal(): void {
    const html = this.sanitizer.bypassSecurityTrustHtml(
      `
          <p class="mb-4">Proyecto Teatros en la ciudad. Estudio socio-histórico de la actividad teatral en Montevideo financiado por el programa Ing. O. Maggiolo CSIC - IM.</p>
          <p class="mb-4">Equipo de investigación: Florencia Dansilio, Camille Gappenne, Chiara Miranda, María Eugenia Ryan, Francis Santana</p>
          <p class="mb-4">Diseño: Luis Ramírez</p>
          <p class="mb-0">Desarrollo: Wilmer Blanco;</p>
        `,
    );
    const modal: IModal = {
      content: {
        subtitle: 'Acerca del Proyecto',
        title: 'Cartografía Teatral de Montevideo',
        html,
        logos: ['/assets/logo-fche.svg', '/assets/logo-facultad.svg', '/assets/logo-imm.svg'],
      },
    };
    this.modalService.openModal(modal);
  }

  private initMap(): void {
    this.map = L.map(MAP_CONTAINER_ID, {
      center: MAP_MVD_CENTER, // Montevideo City
      zoom: MAP_ZOOM,
    });

    const tiles = L.tileLayer('https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png', {
      attribution:
        '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> &copy; <a href="https://carto.com/">CARTO</a>',
      subdomains: 'abcd',
      maxZoom: 18,
      minZoom: 3,
    });

    tiles.addTo(this.map);
  }

  private loadMarks(buildings: IGeoJson): void {
    if (this.featureGroup) {
      this.featureGroup.clearLayers();
    }

    this.featureGroup = L.geoJSON(buildings, {
      pointToLayer(geoJsonPoint: geojson.Feature<geojson.Point, any>, latlng: LatLng): Layer {
        return new L.CircleMarker(latlng, {
          radius: 5,
          fillOpacity: 1,
          color: geoJsonPoint.properties.mapIconColor,
        });
      },
    }).bindTooltip(
      (layer: any) => {
        return layer.feature.properties.name;
      },
      {
        direction: 'top',
        offset: new Point(0, -10),
        opacity: 1,
        className: 'tooltip',
      },
    );

    this.featureGroup
      .on('click', (buildSelected: LeafletMouseEvent) => {
        if (!buildSelected) {
          return;
        }
        const build: any = buildSelected?.layer?.feature.properties;
        this.openModal(build);
      })
      .addTo(this.map);
  }

  private openModal(build: any): void {
    const modal: IModal = ModalService.buildModalContent(build);
    this.modalService.openModal(modal);
  }
}
