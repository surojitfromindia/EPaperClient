interface AutoNumberGroupGenerated {
  auto_number_group_id: number;
  auto_number_group_name: string;
  is_default: boolean;
}

interface AutoNumberGroup extends AutoNumberGroupGenerated {
  auto_number_list: AutoNumber[];
}

interface AutoNumberGroupForSingleEntity extends AutoNumberGroupGenerated {
  auto_number: AutoNumber;
}

interface AutoNumberGenerated {
  number_zero_pad: number;
}

interface AutoNumber extends AutoNumberGenerated {
  entity_type: string;
  prefix_string: string;
  next_number: number;
}

export { AutoNumberGroup, AutoNumberGroupForSingleEntity };
