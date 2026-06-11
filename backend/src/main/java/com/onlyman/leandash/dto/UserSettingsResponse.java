package com.onlyman.leandash.dto;

import lombok.Builder;
import lombok.Getter;

import java.util.List;

@Getter
@Builder
public class UserSettingsResponse {

    private Boolean darkMode;
    private Boolean notificationEnabled;
    private String headerSize;
    private String headerDisplayMode;
    private List<String> hiddenHeaderItems;
    private List<String> headerOrder;
}
