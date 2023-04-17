(function() {
   'use strict';

   if($('#place_confirm_units').length && $('#troopTemplate').length == 0) {

      function buildTroopTemplateDiv() {
         return $('<tr>'
                   + '<th colspan="100%">'
                   + '<div id="troopTemplate" style="margin: auto;">'
                   + '<select id="troopTemplateSelect" style="font-size: 14px;">'
                   + '</select>'
                   + ' <img src="/graphic/overview/note.png" title="Die hier ausgew\u00e4hlte Vorlage wird beim Klicken der nebenstehenden Buttons verwendet.">'
                   + '<button id="insertTemplate" class="btn" style="margin: 0 0.75rem;">Eintragen</button>'
                   + '<button id="newTemplate" class="btn">Neu</button>'
                   + '<button id="editTemplate" class="btn">Bearbeiten</button>'
                   + '<button id="deleteModal" class="btn">L\u00f6schen</button>'
                   + '</div>'
                   + '</th>'
                + '</tr>');
      }

      function buildModal() {
         return $('<div id="modalTroopTemplate">'
                + '<div id="modal-header">'
                + '<h2>Truppen Vorlagen</h2>'
                + '</div>'
                + '<div id="modal-body">'
                + '</div>'
                + '<div id="modal-footer">'
                + '<button id="saveModal" class="btn">Speichern</button>'
                + '<button id="closeModal" class="btn">Schließen</button>'
                + '</div>');
      }

      function styleModal() {

         $('#modalTroopTemplate').css({
            'position' : 'fixed',
            'display' : 'flex',
            'flex-direction' : 'column',
            'min-width' : '500px',
            'max-width' : '850px',
            'background-image' : 'url("/graphic/popup/content_background.png")',
            'border': '19px solid #804000',
            'border-image' : 'url("/graphic/popup/border.png") 19 19 19 19 repeat',
            'left' : 'calc(50% - 342px)',
            'top' : '170px'
         });

         $('#modal-header').css({
            'display' : 'flex',
            'padding' : '0.25rem',
            'cursor' : 'move'
         });

         $('#modal-body').css({
            'position' : 'relative',
            'padding' : '0.5rem 1rem 0 1rem'
         });

         $('#modal-footer').css({
            'display' : 'flex',
            'justify-content' : 'flex-end',
            'padding' : '0 1rem 0.5rem 1rem'
         });

      }

      function buildInputTable(allUnits) {

         let ele = '<div>';
         ele += '<label for="modal-template-text" style="font-size: 14px;">Beschreibung:</label>';
         ele += ' <img src="/graphic/overview/note.png" title="Es gibt drei m\u00f6gliche Eintragungen.&#010;- Fixe Werte: der hinterlegte Wert wird in jedem Feld eingetragen.&#010;- Anzahl an Truppen, die im Dorf bleiben sollen (gekennzeichnet durch ein Minus-Zeichen vor dem Wert): Die restliche Anzahl an Truppen wird auf die neuen Angriffe aufgeteilt.&#010;- Alle: Daf\u00fcr muss die Checkbox der jeweiligen Einheit markiert werden. Alle Truppen der markierten Einheit werden dann gleichm\u00e4ßig aufgeteilt.">';
         ele += '<input id="modal-template-text" type="text" style="width: 99%; font-size: 14px;">';
         ele += '<table id="inputTable" style="margin: 0.5rem 0;">';
         for(let i = 0; i <= 2; i++) {
            ele += '<tr>';
            $.each(allUnits, function(u, unit) {
               if(i == 0) {
                  ele += '<th width="50" style="text-align: center!important;"><img src="/graphic/unit/unit_' + unit + '.png"></th>';
               } else if(i == 1) {
                  ele += '<td><input type="number" modal-unit="' + unit + '" style="width: 44px;"></td>';
               } else {
                  ele += '<td style="text-align: center!important;"><input type="checkbox" modal-unit="' + unit + '"></td>'
               }
            });
            ele += '</tr>';
         }
         ele += '</table>';
         ele += '</div>';

         return ele;
      }

      function createSelectOptions() {
         $('#troopTemplateSelect').empty();
         $.each(troopTemplates, function(i, item) {
            $('#troopTemplateSelect').append($('<option>', {
               'data-id': i,
               'text': item.name
            }));
         });
      }

      let troopTemplates = JSON.parse(localStorage.getItem('troopTemplates'));

      if(troopTemplates == null) {
         troopTemplates = [
            {"name":"Alles & 1 AG","spear":"all","sword":"all","axe":"all","archer":"all","spy":"all","light":"all","marcher":"all","heavy":"all","ram":"all","catapult":"all","knight":"all","snob":"1"},
            {"name":"Kleiner AG Split","spear":"0","sword":"0","axe":"250","archer":"0","spy":"1","light":"50","marcher":"0","heavy":"0","ram":"0","catapult":"0","knight":"0","snob":"1"},
            {"name":"Deff & 1 AG -250 Dual","spear":"-250","sword":"-250","axe":"0","archer":"0","spy":"-50","light":"0","marcher":"0","heavy":"all","ram":"0","catapult":"0","knight":"0","snob":"1"}
         ];
         localStorage.setItem('troopTemplates', JSON.stringify(troopTemplates));
      }

      let allUnits = [];
      $('#place_confirm_units tbody tr:first').children().each(function(index, th) {
         if(index == 0) {
            return;
         }
         allUnits.push($(th).find('a').attr('data-unit'));
      });

      $('#place_confirm_units tbody').prepend(buildTroopTemplateDiv());
      createSelectOptions();

      $('body').append(buildModal());
      $('#modal-body').append(buildInputTable(allUnits));
      styleModal();

      $('#modalTroopTemplate').css('visibility', 'hidden');
      $("#modalTroopTemplate").draggable({ handle: "#modal-header" });

      $('#insertTemplate').click(function(e) {
         e.preventDefault();

         if(troopTemplates.length > 0) {

            let sumUnits = {};
            let selectedTemplate = $('#troopTemplateSelect').find(":selected").attr('data-id');
            let numRows = $('#place_confirm_units tbody > tr').length;

            $('#place_confirm_units tbody > tr').each(function(index, tr) {
               if(index == 0 || index == numRows) {
                  return;
               } else if(index == 1 || index == 2) {
                  $.each(allUnits, function(u, unit) {
                     let ele = $(tr).find('.unit-item-' + unit);
                     if(ele.length) {
                        if(index == 1) {
                           sumUnits[unit] = $(ele).text();
                        } else {
                           sumUnits[unit] = sumUnits[unit] - $(ele).text();
                        }
                     }
                  });
               } else {
                  $.each(allUnits, function(u, unit) {
                     let field = $(tr).find('input[type=number][data-unit=' + unit + ']');
                     if(field.length) {
                        if(troopTemplates[selectedTemplate][unit] == 'all' || troopTemplates[selectedTemplate][unit] < 0) {
                           if(troopTemplates[selectedTemplate][unit] == 'all') {
                              $(field).val(Math.floor(sumUnits[unit] / (numRows - 4)));
                           } else {
                              let calcUnits = Math.floor((sumUnits[unit] - troopTemplates[selectedTemplate][unit].substring(1)) / (numRows - 4));
                              if(calcUnits > 0) {
                                 $(field).val(calcUnits);
                              } else {
                                 $(field).val('0');
                              }
                           }
                        } else {
                           $(field).val(troopTemplates[selectedTemplate][unit]);
                        }
                     }
                  });
               }
            });
            $("#place_confirm_units input[type=number]").last().change();
         }
      });

      $('#editTemplate').click(function(e) {
         e.preventDefault();

         if(troopTemplates.length > 0) {

            let selectedTemplate = $('#troopTemplateSelect').find(":selected").attr('data-id');

            $.each(allUnits, function(u, unit) {
               let inputValue = troopTemplates[selectedTemplate][unit];
               if(inputValue == 'all') {
                  $('input[type=number][modal-unit="' + unit + '"]').val('');
                  $('input[type=checkbox][modal-unit=' + unit + ']').prop('checked', true);
                  $('input[type=number][modal-unit="' + unit + '"]').prop('disabled', true);
               } else {
                  $('input[type=number][modal-unit="' + unit + '"]').val(inputValue);
                  $('input[type=checkbox][modal-unit=' + unit + ']').prop('checked', false);
                  $('input[type=number][modal-unit="' + unit + '"]').prop('disabled', false);
               }
            });

            $("#modal-template-text").val($('#troopTemplateSelect').find(":selected").text());
            $("#modal-template-text").attr('data-id', selectedTemplate);

            localStorage.setItem('troopTemplates', JSON.stringify(troopTemplates));

            $("#modalTroopTemplate").css('visibility', 'visible');
            $("#modal-template-text").focus();
         }
      });

      $("#saveModal").click(function(e) {
         e.preventDefault();

         let newTemplate = false;
         let templateDesc = $('#modal-template-text').val();
         let templateID = $('#modal-template-text').attr('data-id');

         if(!templateID.length) {
            templateID = troopTemplates.length;
            troopTemplates[templateID] = {};
            newTemplate = true;
         }

         if(templateDesc.length) {
            $('input[type=number][modal-unit]').each(function(i, input) {
               let unit = $(input).attr('modal-unit');
               if($('input[type=checkbox][modal-unit=' + unit + ']').is(':checked')) {
                  troopTemplates[templateID][unit] = 'all';
               } else {
                  if($(input).val() != '') {
                     troopTemplates[templateID][unit] = $(input).val();
                  } else {
                     troopTemplates[templateID][unit] = 0;
                  }
               }
            });

            troopTemplates[templateID]['name'] = templateDesc;

            localStorage.setItem('troopTemplates', JSON.stringify(troopTemplates));

            createSelectOptions();

            $("#modalTroopTemplate").css('visibility', 'hidden');
         }
      });

      $("#deleteModal").click(function(e) {
         e.preventDefault();

         if(confirm("Truppen Vorlage wirklich löschen?")) {
            if(troopTemplates.length > 0) {

               let selectedTemplate = $('#troopTemplateSelect').find(":selected").attr('data-id');
               troopTemplates.splice(selectedTemplate, 1);

               localStorage.setItem('troopTemplates', JSON.stringify(troopTemplates));

               createSelectOptions();
               $("#modalTroopTemplate").css('visibility', 'hidden');
            }
         }
      });

      $('#modalTroopTemplate input[type=checkbox]').click(function() {
         $('#modalTroopTemplate input[type=number][modal-unit=' + $(this).attr('modal-unit') + ']').prop('disabled', function(i, v) { return !v; });
      });

      $('#newTemplate').click(function(e) {
         e.preventDefault();
         $('#modal-template-text').val('');
         $('#modal-template-text').attr('data-id', '');
         $('#modalTroopTemplate input[type=number]').val('');
         $('#modalTroopTemplate input[type=number]').prop('disabled', false);
         $('#modalTroopTemplate input[type=checkbox]').prop('checked', false);
         $("#modalTroopTemplate").css('visibility', 'visible');
         $("#modal-template-text").focus();
      });

      $("#closeModal").click(function(e) {
         e.preventDefault();
         $("#modalTroopTemplate").css('visibility', 'hidden');
      });
   }

})();
