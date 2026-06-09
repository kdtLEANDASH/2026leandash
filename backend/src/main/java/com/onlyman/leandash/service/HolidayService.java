package com.onlyman.leandash.service;

import com.onlyman.leandash.dto.CalendarEventDto;
import com.onlyman.leandash.dto.HolidayApiResponseDto;
import jakarta.annotation.PostConstruct;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.w3c.dom.Document;
import org.w3c.dom.NodeList;

import javax.xml.parsers.DocumentBuilderFactory;
import java.net.URI;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;
import java.nio.charset.StandardCharsets;
import java.time.LocalDate;
import java.time.YearMonth;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;

@Service
public class HolidayService {

    private static final String HOLIDAY_API_URL =
            "https://apis.data.go.kr/B090041/openapi/service/SpcdeInfoService/getRestDeInfo";

    @Value("${holiday.api.service-key}")
    private String serviceKey;

    private final HttpClient httpClient = HttpClient.newHttpClient();
    
    private final Map<String, List<HolidayApiResponseDto>> holidayCache = new ConcurrentHashMap<>();

    @PostConstruct
    public void checkHolidayApiKey() {
        System.out.println("HOLIDAY_API_KEY 적용 여부 = " + (serviceKey != null && !serviceKey.isBlank()));
        System.out.println("HOLIDAY_API_KEY 앞 10자리 = " +
                (serviceKey != null && serviceKey.length() >= 10 ? serviceKey.substring(0, 10) : serviceKey));
    }

    public List<CalendarEventDto> getHolidayEvents(LocalDate startDate, LocalDate endDate) {
        List<CalendarEventDto> holidayEvents = new ArrayList<>();

        YearMonth currentMonth = YearMonth.from(startDate);
        YearMonth endMonth = YearMonth.from(endDate);

        while (!currentMonth.isAfter(endMonth)) {
            List<HolidayApiResponseDto> holidays = fetchMonthlyHolidays(
                    currentMonth.getYear(),
                    currentMonth.getMonthValue()
            );

            for (HolidayApiResponseDto holiday : holidays) {
                if (holiday.getLocdate() == null) {
                    continue;
                }

                boolean isInRange =
                        !holiday.getLocdate().isBefore(startDate)
                                && !holiday.getLocdate().isAfter(endDate);

                if (holiday.isPublicHoliday() && isInRange) {
                    holidayEvents.add(holiday.toCalendarEventDto());
                }
            }

            currentMonth = currentMonth.plusMonths(1);
        }

        return holidayEvents;
    }

    private List<HolidayApiResponseDto> fetchMonthlyHolidays(int year, int month) {
        String cacheKey = year + "-" + String.format("%02d", month);

        if (holidayCache.containsKey(cacheKey)) {
            return holidayCache.get(cacheKey);
        }

        try {
            String url = HOLIDAY_API_URL
                    + "?serviceKey=" + serviceKey
                    + "&solYear=" + year
                    + "&solMonth=" + String.format("%02d", month);

            HttpRequest request = HttpRequest.newBuilder()
                    .uri(URI.create(url))
                    .GET()
                    .build();

            HttpResponse<String> response = httpClient.send(
                    request,
                    HttpResponse.BodyHandlers.ofString(StandardCharsets.UTF_8)
            );

            if (response.statusCode() != 200) {
                return List.of();
            }

            List<HolidayApiResponseDto> result = parseHolidayXml(response.body());
            holidayCache.put(cacheKey, result);

            return result;

        } catch (Exception e) {
            e.printStackTrace();
            return List.of();
        }
    }

    private List<HolidayApiResponseDto> parseHolidayXml(String xml) {
        List<HolidayApiResponseDto> holidays = new ArrayList<>();

        try {
            Document document = DocumentBuilderFactory.newInstance()
                    .newDocumentBuilder()
                    .parse(new java.io.ByteArrayInputStream(xml.getBytes(StandardCharsets.UTF_8)));

            document.getDocumentElement().normalize();

            NodeList itemNodes = document.getElementsByTagName("item");

            for (int i = 0; i < itemNodes.getLength(); i++) {
                org.w3c.dom.Node itemNode = itemNodes.item(i);

                if (itemNode.getNodeType() != org.w3c.dom.Node.ELEMENT_NODE) {
                    continue;
                }

                org.w3c.dom.Element itemElement = (org.w3c.dom.Element) itemNode;

                String dateName = getTagValue(itemElement, "dateName");
                String isHoliday = getTagValue(itemElement, "isHoliday");
                String locdateText = getTagValue(itemElement, "locdate");

                LocalDate locdate = parseLocdate(locdateText);

                holidays.add(HolidayApiResponseDto.builder()
                        .dateName(dateName)
                        .isHoliday(isHoliday)
                        .locdate(locdate)
                        .build());
            }

        } catch (Exception e) {
            e.printStackTrace();
            return List.of();
        }

        return holidays;
    }

    private String getTagValue(org.w3c.dom.Element element, String tagName) {
        NodeList nodeList = element.getElementsByTagName(tagName);

        if (nodeList.getLength() == 0 || nodeList.item(0) == null) {
            return null;
        }

        return nodeList.item(0).getTextContent();
    }

    private LocalDate parseLocdate(String locdateText) {
        if (locdateText == null || locdateText.length() != 8) {
            return null;
        }

        int year = Integer.parseInt(locdateText.substring(0, 4));
        int month = Integer.parseInt(locdateText.substring(4, 6));
        int day = Integer.parseInt(locdateText.substring(6, 8));

        return LocalDate.of(year, month, day);
    }
}