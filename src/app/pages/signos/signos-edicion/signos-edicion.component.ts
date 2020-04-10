import { ActivatedRoute, Router, Params } from '@angular/router';
import { SignosService } from '../../../_service/signos.service';
import { FormGroup, FormControl } from '@angular/forms';
import { Signos } from './../../../_model/signos';
import { Component, OnInit } from '@angular/core';
import { switchMap } from 'rxjs/operators';
import { Paciente } from 'src/app/_model/paciente';
import { Observable } from 'rxjs';
import { PacienteService } from 'src/app/_service/paciente.service';
import { map } from 'rxjs/operators';


@Component({
  selector: 'app-signos-edicion',
  templateUrl: './signos-edicion.component.html',
  styleUrls: ['./signos-edicion.component.css']
})
export class SignosEdicionComponent implements OnInit {

  id: number;
  signos: Signos;
  form: FormGroup;
  edicion: boolean;
  pacientes: Paciente[] = [];
  pacienteSeleccionado: Paciente;

    //utiles para el autocomplete
    myControlPaciente: FormControl = new FormControl();

    pacientesFiltrados: Observable<any[]>;
    
  constructor(
    private pacienteService: PacienteService,
    private signosService: SignosService, 
    private route: ActivatedRoute, 
    private router: Router
    ) {  }

  ngOnInit() {
    this.signos = new Signos();

    this.form = new FormGroup({
      'paciente': this.myControlPaciente,
      'id': new FormControl(0),
      'fecha': new FormControl(new Date()),
      'temperatura': new FormControl(''),
      'pulso': new FormControl(''),
      'ritmoRespiratorio': new FormControl('')
    });

    this.route.params.subscribe((params: Params) => {
      this.id = params['id'];
      this.edicion = params['id'] != null;
      this.initForm();
    });
    this.listarPacientes();
    this.pacientesFiltrados = this.myControlPaciente.valueChanges.pipe(map(val => this.filtrarPacientes(val)));

  }
  filtrarPacientes(val : any){
    if (val != null && val.idPaciente > 0) {
      return this.pacientes.filter(option =>
        option.nombres.toLowerCase().includes(val.nombres.toLowerCase()) || option.apellidos.toLowerCase().includes(val.apellidos.toLowerCase()) || option.dni.includes(val.dni));
    } else {
      return this.pacientes.filter(option =>
        option.nombres.toLowerCase().includes(val.toLowerCase()) || option.apellidos.toLowerCase().includes(val.toLowerCase()) || option.dni.includes(val));
    }
  }
  initForm() {
    if (this.edicion) {
      this.signosService.listarPorId(this.id).subscribe(data => {
        let id = data.idSignos;
        let fecha = data.fecha;
        let paciente=data.paciente;
        let temperatura=data.temperatura;
        let pulso = data.pulso;
        let ritmoRespiratorio = data.ritmoRespiratorio;
        
        this.form = new FormGroup({
          'id': new FormControl(id),
          'paciente': this.myControlPaciente,
          'fecha': new FormControl(fecha),
          'temperatura': new FormControl(temperatura),
          'pulso': new FormControl(pulso),
          'ritmoRespiratorio': new FormControl(ritmoRespiratorio)
        });
        this.form.controls['paciente'].setValue(paciente);
      });
    }
  }

  operar() {
    this.signos.idSignos = this.form.value['id'];
    this.signos.paciente = this.form.value['paciente'];

    this.signos.fecha =this.form.value['fecha'];
   
    this.signos.temperatura =this.form.value['temperatura'];
    this.signos.pulso = this.form.value['pulso'];
    this.signos.ritmoRespiratorio =this.form.value['ritmoRespiratorio'];
    
    if (this.signos != null && this.signos.idSignos > 0) {
      //BUENA PRACTICA
      this.signosService.modificar(this.signos).pipe(switchMap(() => {
        return this.signosService.listar();
      })).subscribe(data => {
        this.signosService.signosCambio.next(data);
        this.signosService.mensajeCambio.next("Se modificó");
      });

    } else {
      //PRACTICA COMUIN
      this.signosService.registrar(this.signos).subscribe(data => {
        this.signosService.listar().subscribe(signos => {
          this.signosService.signosCambio.next(signos);
          this.signosService.mensajeCambio.next("Se registró");
        });
      });
    }

    this.router.navigate(['signos']);
  }
  mostrarPaciente(val : Paciente){
    return val ? `${val.nombres} ${val.apellidos}` : val;
  }
  seleccionarPaciente(e: any) {
    this.pacienteSeleccionado = e.option.value;
  }
  listarPacientes() {
    this.pacienteService.listar().subscribe(data => {
      this.pacientes = data;
    });
  }

}
