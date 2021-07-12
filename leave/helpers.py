import json
import datetime

from .models import (
    LeaveMask,
    ConfigEntry,
)

def get_mask(**kwargs):
    user = kwargs.get("user")
    year = kwargs.get("year")

    mask_name = "{user}_{year}".format(user=user, year=year)
    try:
        mask = LeaveMask.objects.get(name=mask_name)
        return mask
    except LeaveMask.DoesNotExist:
        mask = LeaveMask.objects.get(name="__{year}".format(year=year))
        mask.name = mask_name
        mask.pk = None
        mask.save()
        return mask

def accumulate_mask(mask, leave_requests):
    leave_type_config = ConfigEntry.objects.get(name='leave_context')
    leave_types = json.loads(leave_type_config.extra)['leave_types']

    arr = list(mask.value)

    priority_to_type = {leave_type['priority']: leave_type['name'] for leave_type in leave_types}
    type_to_priority = {leave_type['name']: leave_type['priority'] for leave_type in leave_types}
    summary = {leave_type['name']: 0 for leave_type in leave_types}

    for leave_request in leave_requests:
        # represent every day with 2 characters, each for the morning and afternoon shift
        start = datetime.datetime.strptime(leave_request.startdate, '%Y%m%d').timetuple().tm_yday
        start = 2 * (start - 1) + (leave_request.half[0] == "1")
        end = datetime.datetime.strptime(leave_request.enddate, '%Y%m%d').timetuple().tm_yday
        end = 2 * (end - 1) + (leave_request.half[1] == "0")

        priority = type_to_priority[leave_request.typ]
        
        # '-': work day
        # '0': holiday/weekend
        # otherwise: on leave, the representing character is the same as the leave type's priority,
        #            lower priority value means higher priority
        for i in range(start, end + 1):
            if arr[i] == '-' or int(arr[i]) > priority:
                this_type = priority_to_type[priority]
                summary[this_type] = summary[this_type] + 1
                if arr[i] != '-' and arr[i] != '0':
                    last_type = priority_to_type[int(arr[i])]
                    summary[last_type] = summary[last_type] - 1

                arr[i] = str(priority)

    mask.value = ''.join(arr)
    old_summary = json.loads(mask.summary)
    new_summary = {leave_type: summary[leave_type] + old_summary[leave_type] for leave_type in summary}
    mask.summary = json.dumps(new_summary, indent=2)
    mask.save(update_fields=['value', 'summary'])
